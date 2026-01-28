import { google } from 'googleapis';
import { Readable } from 'node:stream';
import { ENV } from './_core/env';
import * as db from './db';

/**
 * Inicializa o cliente Google Drive com Service Account
 */
function getServiceAccountAuth() {
  try {
    const credentials = JSON.parse(ENV.googleDriveServiceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    return auth;
  } catch (error) {
    console.error('Erro ao inicializar autenticação do Google Drive:', error);
    throw new Error('Credenciais do Google Drive inválidas');
  }
}

/**
 * Obtém o cliente Google Drive autenticado
 */
function getDriveClient() {
  const auth = getServiceAccountAuth();
  return google.drive({ version: 'v3', auth });
}

/**
 * Cria ou obtém uma pasta no Google Drive
 */
async function getOrCreateFolder(parentFolderId: string, folderName: string): Promise<string> {
  const drive = getDriveClient();

  try {
    // Procura por pasta existente com o mesmo nome
    const response = await drive.files.list({
      q: `'${parentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id)',
      pageSize: 1,
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id!;
    }

    // Cria nova pasta se não existir
    const createResponse = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      },
      fields: 'id',
    });

    return createResponse.data.id!;
  } catch (error) {
    console.error('Erro ao criar/obter pasta:', error);
    throw error;
  }
}

/**
 * Cria a estrutura de pastas: Loja > Área > Curso
 */
async function createFolderStructure(storeId: number, courseId: number, area: 'vendas' | 'pos_vendas'): Promise<string> {
  try {
    const rootFolderId = ENV.googleDriveRootFolderId;
    if (!rootFolderId) {
      throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID não configurado');
    }

    // Obter informações da loja
    const store = await db.getStoreById(storeId);
    if (!store) {
      throw new Error('Loja não encontrada');
    }

    // Obter informações do curso
    const course = await db.getCourseById(courseId);
    if (!course) {
      throw new Error('Curso não encontrado');
    }

    // Criar/obter pasta da loja
    const storeFolderId = await getOrCreateFolder(rootFolderId, `${store.storeCode} - ${store.storeName}`);

    // Criar/obter pasta da área
    const areaName = area === 'vendas' ? 'Vendas' : 'Pós-Vendas';
    const areaFolderId = await getOrCreateFolder(storeFolderId, areaName);

    // Criar/obter pasta do curso
    const courseFolderId = await getOrCreateFolder(areaFolderId, course.title);

    return courseFolderId;
  } catch (error) {
    console.error('Erro ao criar estrutura de pastas:', error);
    throw error;
  }
}

/**
 * Faz upload de um certificado para o Google Drive
 */
export async function uploadCertificate(
  storeId: number,
  courseId: number,
  area: 'vendas' | 'pos_vendas',
  fileName: string,
  fileBuffer: Buffer | Uint8Array,
  employeeName: string,
  mimeType: string = 'application/pdf'
): Promise<{ fileId: string; fileUrl: string }> {
  try {
    // Criar estrutura de pastas
    const courseFolderId = await createFolderStructure(storeId, courseId, area);

    // Fazer upload do arquivo
    const drive = getDriveClient();
    const timestamp = new Date().toISOString().split('T')[0];
    const uploadFileName = `${employeeName} - ${timestamp} - ${fileName}`;

    // Converter para Buffer se for Uint8Array
    const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
    
    // Criar stream a partir do buffer
    const stream = Readable.from(buffer);

    const response = await drive.files.create({
      requestBody: {
        name: uploadFileName,
        parents: [courseFolderId],
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id, webViewLink',
    });

    const fileId = response.data.id!;
    const fileUrl = response.data.webViewLink!;

    // Verificar se pasta já existe antes de criar
    const course = await db.getCourseById(courseId);
    if (course) {
      const folderPath = `${area === 'vendas' ? 'Vendas' : 'Pós-Vendas'}/${course.title}`;
      // Apenas criar se não existir
      try {
        await db.createCourseFolder({
          courseId,
          area,
          folderId: courseFolderId,
          folderPath,
        });
      } catch (dbError) {
        // Se falhar por duplicação, apenas log (não falha o upload)
        console.warn('Pasta já registrada no banco de dados:', dbError);
      }
    }

    return {
      fileId,
      fileUrl,
    };
  } catch (error) {
    console.error('Erro ao fazer upload do certificado:', error);
    throw error;
  }
}

/**
 * Obtém a URL de um certificado
 */
export async function getCertificateUrl(fileId: string): Promise<string> {
  try {
    const drive = getDriveClient();
    const response = await drive.files.get({
      fileId,
      fields: 'webViewLink',
    });
    return response.data.webViewLink!;
  } catch (error) {
    console.error('Erro ao obter URL do certificado:', error);
    throw error;
  }
}

/**
 * Testa a conexão com Google Drive
 */
export async function testGoogleDriveConnection(): Promise<boolean> {
  try {
    if (!ENV.googleDriveServiceAccountJson || !ENV.googleDriveRootFolderId) {
      console.error('Credenciais do Google Drive não configuradas');
      return false;
    }
    const drive = getDriveClient();
    const response = await drive.files.list({
      pageSize: 1,
      fields: 'files(id)',
    });
    return !!response.data.files;
  } catch (error) {
    console.error('Erro ao testar conexão com Google Drive:', error);
    return false;
  }
}

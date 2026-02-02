import { storagePut } from './storage';
import * as db from './db';

/**
 * Faz upload de um certificado para S3
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
    // Converter para Buffer se for Uint8Array
    const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);

    // Criar caminho no S3 com estrutura: certificates/storeId/courseId/area/fileName
    const timestamp = new Date().toISOString().split('T')[0];
    const uploadFileName = `${employeeName} - ${timestamp} - ${fileName}`;
    const s3Key = `certificates/${storeId}/${courseId}/${area}/${uploadFileName}`;

    // Fazer upload para S3
    const { url, key } = await storagePut(s3Key, buffer, mimeType);

    // Registrar pasta no banco de dados (para rastreamento)
    const course = await db.getCourseById(courseId);
    if (course) {
      const folderPath = `${area === 'vendas' ? 'Vendas' : 'Pós-Vendas'}/${course.title}`;
      try {
        await db.createCourseFolder({
          courseId,
          area,
          folderId: key, // Usar a chave S3 como ID
          folderPath,
        });
      } catch (dbError) {
        // Se falhar por duplicação, apenas log (não falha o upload)
        console.warn('Pasta já registrada no banco de dados:', dbError);
      }
    }

    return {
      fileId: key,
      fileUrl: url,
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
    // fileId é a chave S3
    const { url } = await storagePut(fileId, Buffer.from(''), 'application/pdf');
    return url;
  } catch (error) {
    console.error('Erro ao obter URL do certificado:', error);
    throw error;
  }
}

/**
 * Testa a conexão com S3
 */
export async function testGoogleDriveConnection(): Promise<boolean> {
  try {
    // Teste simples: tentar fazer upload de um arquivo vazio
    await storagePut('test/connection-test.txt', Buffer.from('test'), 'text/plain');
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão com S3:', error);
    return false;
  }
}

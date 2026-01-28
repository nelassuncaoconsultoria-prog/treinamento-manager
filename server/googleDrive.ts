import { google } from 'googleapis';
import { ENV } from './_core/env';

/**
 * Inicializa o cliente OAuth2 do Google
 */
export function getGoogleAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    ENV.googleClientId,
    ENV.googleClientSecret,
    ENV.googleRedirectUri
  );
  return oauth2Client;
}

/**
 * Gera a URL de autenticação do Google Drive
 */
export function getGoogleAuthUrl() {
  const oauth2Client = getGoogleAuthClient();
  const scopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  return url;
}

/**
 * Troca o código de autorização por tokens
 */
export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getGoogleAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Cria um cliente Google Drive autenticado
 */
export function createDriveClient(accessToken: string) {
  const oauth2Client = getGoogleAuthClient();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
  });

  return drive;
}

/**
 * Cria uma pasta no Google Drive
 */
export async function createFolder(accessToken: string, folderName: string, parentFolderId?: string) {
  const drive = createDriveClient(accessToken);

  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentFolderId && { parents: [parentFolderId] }),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id, name, webViewLink',
  });

  return {
    id: response.data.id,
    name: response.data.name,
    webViewLink: response.data.webViewLink,
  };
}

/**
 * Faz upload de um arquivo para o Google Drive
 */
export async function uploadFile(
  accessToken: string,
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string,
  parentFolderId?: string
) {
  const drive = createDriveClient(accessToken);

  const fileMetadata = {
    name: fileName,
    ...(parentFolderId && { parents: [parentFolderId] }),
  };

  const media = {
    mimeType: mimeType,
    body: fileBuffer,
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, name, webViewLink, mimeType',
  });

  return {
    id: response.data.id,
    name: response.data.name,
    webViewLink: response.data.webViewLink,
    mimeType: response.data.mimeType,
  };
}

/**
 * Obtém informações de um arquivo no Google Drive
 */
export async function getFileInfo(accessToken: string, fileId: string) {
  const drive = createDriveClient(accessToken);

  const response = await drive.files.get({
    fileId: fileId,
    fields: 'id, name, webViewLink, mimeType, createdTime',
  });

  return response.data;
}

/**
 * Lista arquivos em uma pasta
 */
export async function listFilesInFolder(accessToken: string, folderId: string) {
  const drive = createDriveClient(accessToken);

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    spaces: 'drive',
    fields: 'files(id, name, mimeType, webViewLink)',
  });

  return response.data.files || [];
}

/**
 * Deleta um arquivo do Google Drive
 */
export async function deleteFile(accessToken: string, fileId: string) {
  const drive = createDriveClient(accessToken);

  await drive.files.delete({
    fileId: fileId,
  });

  return true;
}

/**
 * Compartilha um arquivo com um usuário
 */
export async function shareFile(
  accessToken: string,
  fileId: string,
  email: string,
  role: 'reader' | 'writer' | 'owner' = 'reader'
) {
  const drive = createDriveClient(accessToken);

  const response = await drive.permissions.create({
    fileId: fileId,
    requestBody: {
      role: role,
      type: 'user',
      emailAddress: email,
    },
    fields: 'id',
  });

  return response.data;
}

#!/usr/bin/env python3
"""
Sync files from Google Drive folder using a Service Account.
Saves downloaded files into `raw_papers/`.
"""

import io
import json
import os
import sys
from pathlib import Path


def sync_drive():
    folder_id = os.environ.get("GDRIVE_FOLDER_ID")
    service_account_raw = os.environ.get("GDRIVE_SERVICE_ACCOUNT_KEY")

    dest_dir = Path("raw_papers")
    dest_dir.mkdir(parents=True, exist_ok=True)

    if not folder_id or not service_account_raw:
        print("⚠️ [WARNING] Google Drive credentials not found:")
        if not service_account_raw:
            print("   - GDRIVE_SERVICE_ACCOUNT_KEY is missing")
        if not folder_id:
            print("   - GDRIVE_FOLDER_ID is missing")
        print(
            "\nℹ️ Please configure them in GitHub Repo Settings > Secrets and variables > Actions."
        )
        print(
            f"ℹ️ Skipping Google Drive sync. Using {len(list(dest_dir.glob('*.md')))} existing files in {dest_dir}/."
        )
        return

    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaIoBaseDownload
    except ImportError:
        print("❌ [ERROR] Missing Google API dependencies.")
        print("Run: pip install google-api-python-client google-auth")
        sys.exit(1)

    try:
        service_account_info = json.loads(service_account_raw)
    except Exception as e:
        print(f"❌ [ERROR] Failed to parse GDRIVE_SERVICE_ACCOUNT_KEY JSON: {e}")
        sys.exit(1)

    scopes = ["https://www.googleapis.com/auth/drive.readonly"]
    creds = service_account.Credentials.from_service_account_info(
        service_account_info, scopes=scopes
    )
    service = build("drive", "v3", credentials=creds)

    print(f"🔍 Searching Google Drive folder: {folder_id} ...")
    query = f"'{folder_id}' in parents and trashed = false"

    try:
        results = (
            service.files()
            .list(q=query, fields="files(id, name, mimeType, modifiedTime)")
            .execute()
        )
    except Exception as e:
        print(f"❌ [ERROR] Drive API list call failed: {e}")
        sys.exit(1)

    files = results.get("files", [])
    print(f"📄 Found {len(files)} files in Google Drive folder.")

    downloaded_count = 0
    for file in files:
        file_id = file["id"]
        file_name = file["name"]
        mime_type = file["mimeType"]

        # Normalize file path and extension
        if mime_type == "application/vnd.google-apps.document":
            safe_name = file_name if file_name.endswith(".md") else f"{file_name}.md"
            file_path = dest_dir / safe_name
            print(f"📥 Exporting Google Doc '{file_name}' -> {file_path.name} ...")
            request = service.files().export_media(
                fileId=file_id, mimeType="text/plain"
            )
        else:
            # Only sync Markdown or text documents
            if not (file_name.endswith(".md") or file_name.endswith(".txt")):
                print(f"⏭️ Skipping non-markdown file: {file_name} ({mime_type})")
                continue
            file_path = dest_dir / file_name
            print(f"📥 Downloading '{file_name}' -> {file_path.name} ...")
            request = service.files().get_media(fileId=file_id)

        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()

        file_path.write_bytes(fh.getvalue())
        downloaded_count += 1
        print(f"✅ Successfully saved: {file_path.name}")

    print(f"🎉 Sync completed. Total {downloaded_count} files updated in {dest_dir}/")


if __name__ == "__main__":
    sync_drive()

This extension strips URLDefense's tracking from GMail and Outlook. There are
security benefits to after-the-fact click tracking, but I personally don't want
reveal which links I click on and when or share awkward links when I forward
emails.

Obviously use this at your own risk.

This extension also intercepts requests to urldefense and redirects to the original URL.

### Installation Instructions
**Google Chrome** 
> [!WARNING]
> Manifest 2.0 extensions are deprecated in Chrome and support is planned to be removed sometime in 2024. 

1. Download this repo as a ZIP file from GitHub.
2. Unzip the file and you should have a folder named `unURLDefense-master`.
3. In Chrome/Edge go to the extensions page (`chrome://extensions` or `edge://extensions`).
4. Enable Developer Mode.
5. Drag the `unURLDefense-master` folder anywhere on the page to import it. Or click the "Load unpacked" button and select the folder.

**Firefox**
1. Download this repo as a ZIP file from GitHub.
2. Unzip the file and you should have a folder named `unURLDefense-master`.
3. Go to `about:debugging#/runtime/this-firefox` and click the "Load temporary add-on" button to load the `manifest.json` file.
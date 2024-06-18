// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { resolve } from "path";
import {
  writeFileSync,
  readFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
} from "fs";
import { collectScreenshots, deployScreenshots } from "./lib/screenshots";

interface SupportedFiles extends vscode.QuickPickItem {
  value: string;
  preSelected?: boolean;
}

interface ComponentData {
  name: string;
  supportedFiles: SupportedFiles[];
}

const SUPPORTED_FILES_OPTIONS: SupportedFiles[] = [
  {
    label: "functions.php",
    value: "functions.php",
    preSelected: true,
  },
  {
    label: "index.twig",
    value: "index.twig",
    preSelected: true,
  },
  {
    label: "_style.scss",
    value: "_style.scss",
    preSelected: true,
  },
  {
    label: "script.js",
    value: "script.js",
  },
  {
    label: "admin.js",
    value: "admin.js",
  },
  {
    label: "_admin.scss",
    value: "_admin.scss",
  },
];

function createComponentAndAddFile(
  componentInfos: ComponentData,
  componentDir: string
) {
  const componentFolder = resolve(componentDir, componentInfos.name);
  if (!existsSync(componentFolder)) {
    mkdirSync(componentFolder, {
      recursive: true,
    });
  }

  componentInfos.supportedFiles.forEach((v) => {
    const file = v.value;
    try {
      let fileContend: string = readFileSync(
        resolve(__dirname, "assets", file),
        {
          encoding: "utf8",
          flag: "r",
        }
      );

      fileContend = fileContend.replaceAll(
        "<component_name>",
        componentInfos.name
      );
      writeFileSync(resolve(componentFolder, file), fileContend, {
        encoding: "utf8",
        flag: "a+",
      });
    } catch (e) {
      console.error(e);
      return;
    }
  });
}

export function activate(context: vscode.ExtensionContext) {
  let disposableGenerateComponent = vscode.commands.registerCommand(
    "flynt-component-generator.generate",
    (folder) => {
      let componentInfos: ComponentData = {
        name: "",
        supportedFiles: [],
      };

      const componentNameInputBox = vscode.window.createInputBox();
      componentNameInputBox.placeholder = "component name";
      const componentSupportFiles =
        vscode.window.createQuickPick<SupportedFiles>();
      componentSupportFiles.placeholder = "supported files";
      componentSupportFiles.canSelectMany = true;
      componentSupportFiles.items = SUPPORTED_FILES_OPTIONS;
      componentSupportFiles.selectedItems = SUPPORTED_FILES_OPTIONS.filter(
        (v) => v.preSelected
      );
      componentSupportFiles.onDidChangeSelection((e) => {
        componentInfos.supportedFiles = e as SupportedFiles[];
      });

      componentNameInputBox.onDidAccept((e) => {
        componentNameInputBox.hide();
        componentInfos.name = componentNameInputBox.value;
        if (!componentInfos.name) {
          return;
        }

        componentSupportFiles.onDidAccept((e) => {
          if (componentInfos.supportedFiles.length === 0) {
            return;
          }
          componentSupportFiles.hide();
          createComponentAndAddFile(componentInfos, folder.path);
        });
        componentSupportFiles.show();
      });
      componentNameInputBox.show();

      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World");
    }
  );
  context.subscriptions.push(disposableGenerateComponent);

  let disposableAddFiles = vscode.commands.registerCommand(
    "flynt-component-generator.addFiles",
    (folder) => {
      const includedFiles = readdirSync(folder.path);
      const folderArray = folder.path.split("/");

      let componentInfos: ComponentData = {
        name: "",
        supportedFiles: [],
      };
      componentInfos.name = folderArray.pop();
      const folderPathWithoutComponent = folderArray.join("/");

      const componentSupportFiles =
        vscode.window.createQuickPick<SupportedFiles>();
      componentSupportFiles.placeholder = "supported files";
      componentSupportFiles.canSelectMany = true;
      const availableFiles = SUPPORTED_FILES_OPTIONS.filter(
        (v) => !includedFiles.includes(v.value)
      );
      componentSupportFiles.items = availableFiles;
      componentSupportFiles.selectedItems = availableFiles.filter(
        (v) => v.preSelected
      );
      componentSupportFiles.onDidChangeSelection((e) => {
        componentInfos.supportedFiles = e as SupportedFiles[];
      });
      componentSupportFiles.onDidAccept((e) => {
        if (componentInfos.supportedFiles.length === 0) {
          return;
        }
        componentSupportFiles.hide();
        createComponentAndAddFile(componentInfos, folderPathWithoutComponent);
      });
      componentSupportFiles.show();
    }
  );
  context.subscriptions.push(disposableAddFiles);

  let disposableCollectScreenshots = vscode.commands.registerCommand(
    "flynt-component-generator.collectScreenshots",
    (folder) => {
      const componentsDir = folder.path;
      collectScreenshots(componentsDir);
    }
  );
  context.subscriptions.push(disposableCollectScreenshots);

  let disposableDeployScreenshots = vscode.commands.registerCommand(
    "flynt-component-generator.deployScreenshots",
    (folder) => {
      const componentsDir = folder.path;
      deployScreenshots(componentsDir);
    }
  );
  context.subscriptions.push(disposableDeployScreenshots);
}

// This method is called when your extension is deactivated
export function deactivate() {}

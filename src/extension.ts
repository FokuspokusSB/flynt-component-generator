// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { resolve } from "path";
import { writeFileSync, readFileSync, mkdirSync } from "fs";

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
    label: "admin",
    value: "admin.js",
  },
];

function createComponent(componentInfos: ComponentData, componentDir: string) {
  const componentFolder = resolve(componentDir, componentInfos.name);
  mkdirSync(componentFolder, {
    recursive: true,
  });
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
  console.log(
    'Congratulations, your extension "flynt-component-generator" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
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
          console.log(componentInfos.supportedFiles);
          if (componentInfos.supportedFiles.length === 0) {
            return;
          }
          componentSupportFiles.hide();
          createComponent(componentInfos, folder.path);
        });
        componentSupportFiles.show();
      });
      componentNameInputBox.show();

      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World");
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

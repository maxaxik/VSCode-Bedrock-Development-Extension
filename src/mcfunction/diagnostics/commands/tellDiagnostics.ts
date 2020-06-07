import * as vscode from 'vscode';
import { DiagnosticsManager,DiagnosticProvider } from '../DiagnosticsManager';
import { SyntaxItem } from '../../../general/include';

export class tellDiagnosticProvider implements DiagnosticProvider {

	//provides diagnostics
	provideDiagnostic(item: SyntaxItem, lineIndex: number, collector: vscode.Diagnostic[], dm: DiagnosticsManager, document: vscode.TextDocument) : void {

		//<target: target>
		if (word == undefined) {
			//MISSING ERROR
		}
		dm.SelectorDiagnoser(word, lineIndex, collector, dm, document);

		//<message: message>
		if (word == undefined) {
			//MISSING ERROR
		}

	}

}

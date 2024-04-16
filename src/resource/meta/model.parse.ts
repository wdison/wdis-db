import { FieldModel, MetaModel, ModelTypeEnum } from "../../meta.model";

export class ModelParse {
    parse(modelStr: string = 'NOTHING'): MetaModel {
        if (modelStr == 'NOTHING') throw new Error('Model Invalid!');

        let modelName = '', modelType = '';
        let modelInterfaces: string[] = [];
        let fields: FieldModel[] = [];
        let lines: string[] = modelStr.split('\n');
        lines.forEach((line, idx) => {
            line = line.trim();
            if (idx == 0) {
                let writerType = (letter: string) => { modelType += letter.trim() };
                let writerName = (letter: string) => { modelName += letter.trim() };
                let writer = writerType;
                for (let i = 0; i < line.length; i++) {
                    if (line[i] == '{') continue;
                    if (line[i] == ' ') writer = writerName;
                    writer(line[i]);
                }
            } else {
                if (line.startsWith('@@')) {
                    // interfaces do metamodel
                    modelInterfaces.push(line);
                } else if(line == '}'){
                } else {
                    fields.push(this.parseSimpleField(line));
                }
            }
        });

        let metaModel = new MetaModel(modelName, null, fields);
        metaModel.type = modelType;
        metaModel.interfaces = modelInterfaces;
        if (!Object.keys(ModelTypeEnum).includes(modelType)) throw new Error('Unknown Model Type!');
        return metaModel;
    }

    private parseSimpleField(line: string): FieldModel {
        // console.log(line);
        let arrConteudo:string[] = [];
        let isAspasOpen = false, qtdPareOpen = 0, qtdConteudo = 0, isInConteudo=false;
        for (let i = 0; i < line.length; i++) {
            if(isInConteudo && [' ','\t'].includes(line[i]) && (qtdConteudo<2||(!isAspasOpen && qtdPareOpen ==0))){
                isInConteudo = false;
                qtdConteudo++;
            } else {
                if(!isInConteudo && ![' ','\t'].includes(line[i])) {
                    isInConteudo = true;
                    arrConteudo.push('');
                }
                if(line[i]=='(')qtdPareOpen++;
                if(line[i]==')')qtdPareOpen--;
                if(line[i]=='"')isAspasOpen=!isAspasOpen;
                if(![' ','\t'].includes(line[i]) || ((isAspasOpen || qtdPareOpen>0) && qtdConteudo >= 2)) {
                    arrConteudo[qtdConteudo]+=line[i];
                }
            }
        }
        let fieldName = arrConteudo[0];
        let fieldType = arrConteudo[1];
        let nullable = false;
        let interfaces = arrConteudo.slice(2);
        // console.log('ARRAY: '+JSON.stringify(arrConteudo));
        
        if(fieldName.includes('?')){
            nullable = true;
            fieldName = fieldName.replace('?', '');
        }
        let fieldModel = new FieldModel(fieldName, fieldType, nullable, interfaces);
        return fieldModel;
    }
}
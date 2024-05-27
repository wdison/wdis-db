import { access, rm } from "fs/promises";

export class TestUtil{
    public static waitFor(millis:number):Promise<void> {
        return new Promise((accept)=>{
            setTimeout(() => {
                accept(undefined);
            }, millis);
        });
    }
    
    public static async rmFile(filePath:string, opts = { recursive: false }):Promise<void> {
        try {
            await access(filePath);
            await rm(filePath, opts);
            console.log('excluido com sucesso: '+filePath);
        } catch (error:any) {
            console.log('Saide de erro ao remover: '+JSON.stringify(error));
            if (error.message.includes('no such file or directory')) {
            } else {
                throw error;
            }
        }
    }
}
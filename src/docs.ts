import fs from "fs";

export const createDocx = async (filename: string, content: string) => {
    const { Document, Packer, Paragraph, TextRun } = await import("docx");
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: content,
                                bold: true,
                            }),
                        ],
                    }),
                ],
            },
        ],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filename, buffer);
};
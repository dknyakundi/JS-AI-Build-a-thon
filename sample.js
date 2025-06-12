import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import "dotenv/config";
import fs from "fs";
import path from "path";


const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
// Using a multimodal model that can process images
const model = "openai/gpt-4o-mini";

export async function main() {
    // Read the image file and convert to base64
    const imagePath = path.join(process.cwd(), "contoso_layout_sketch.jpg");
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    const client = ModelClient(
        endpoint,
        new AzureKeyCredential(token),
    );

    const response = await client.path("/chat/completions").post({
        body: {
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { 
                    role: "user", 
                    content: [
                        { 
                            type: "text", 
                            text: "Write HTML and CSS code for a modern looking web page based on the following hand-drawn sketch"
                        },
                        { 
                            type: "image_url", 
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            temperature: 0.7,
            top_p: 1.0,
            max_tokens: 4000,
            model: model
        }
    });

    if (isUnexpected(response)) {
        throw response.body.error;
    }

    console.log(response.body.choices[0].message.content);
}

main().catch((err) => {
    console.error("The sample encountered an error:", err);
});


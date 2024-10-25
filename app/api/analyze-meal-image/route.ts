import { NextResponse } from "next/server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(image.split(',')[1], 'base64');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a nutrition expert specializing in bodybuilding and muscle gain. Analyze meals and provide accurate nutritional information optimized for muscle gain tracking.",
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyze this meal and provide detailed nutritional information. Include a descriptive name and detailed description. Focus on accuracy for muscle gain tracking. Include portion sizes if visible." 
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    // Parse the response into structured data
    const analysis = completion.choices[0].message.content;
    
    // Use another GPT call to structure the data
    const structuredCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Convert the meal analysis into a structured JSON format. Return ONLY a JSON object with these exact fields: name (string), description (string), calories (number), protein (number), carbs (number), fats (number). Ensure all numeric values are numbers, not strings.",
        },
        {
          role: "user",
          content: analysis || "",
        },
      ],
      response_format: { type: "json_object" },
    });

    const structuredData = JSON.parse(structuredCompletion.choices[0].message.content || "{}");

    return NextResponse.json(structuredData);
  } catch (error) {
    console.error("Meal image analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze meal image" },
      { status: 500 }
    );
  }
}
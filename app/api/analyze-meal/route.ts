import { NextResponse } from "next/server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a nutrition expert specializing in bodybuilding and muscle gain. Analyze meals and provide accurate nutritional information.",
        },
        {
          role: "user",
          content: `Analyze this meal and provide nutritional information optimized for muscle gain:

${description}

Return a JSON object with these fields:
{
  "name": "Brief name for the meal",
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fats": number (in grams)
}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(response || "{}"));
  } catch (error) {
    console.error("Meal analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze meal" },
      { status: 500 }
    );
  }
}
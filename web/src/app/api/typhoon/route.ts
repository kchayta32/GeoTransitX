import { NextRequest, NextResponse } from "next/server";

const TYPHOON_API_KEY = process.env.TYPHOON_API_KEY || "sk-ZtLbj1CsBusuCbW0LPbNE2UWOJpqTKW9AIteX7bTzV9CaOTE";
const TYPHOON_BASE_URL = "https://api.opentyphoon.ai/v1";
const TYPHOON_MODEL = "typhoon-v2.5-30b-a3b-instruct";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, contextData } = body;

    const systemPrompt = `คุณคือ "GeoTransitX AI Advisor" ผู้ช่วยผู้เชี่ยวชาญด้านการวิเคราะห์ข้อมูลเมือง การจราจรเชิงคาดการณ์ (Predictive Traffic) และการวางแผนขนส่งอัจฉริยะ (Smart Mobility) ประจำระบบ GeoTransitX
คุณมีความรู้ลึกซึ้งเกี่ยวกับ:
1. การสำรวจทางอากาศและภาพถ่ายโดรน Orthophoto ณ สนามบินบางพระ (Bang Phra Airport, Chon Buri - EEC Zone) ครอบคลุม 60,395 ตร.ม. ความละเอียด GSD 2.62 ซม., ความแม่นยำ GCP 1.3 ซม., จุด Point Cloud 10.5 ล้านจุด
2. ผลตรวจจับ GeoAI (YOLOv8): ตรวจจับวัตถุ 30 รายการ (รถยนต์, รถบรรทุกบริการ, เครื่องบินฝึกบินบน Apron, บุคลากร)
3. โครงสร้างพื้นฐาน: ลานจอดอาคารผู้โดยสาร (ความจุ 65 คัน, อัตราครองพื้นที่ 64.6%), ลานจอดโรงเก็บ (ความจุ 30 คัน, 60%), ลานจอดอากาศยาน (12 ลำ)
4. การจำลองการจราจร 24 ชม.: ยานพาหนะรวม 4,820 คัน/วัน, ช่วงเร่งด่วนเช้า 08:15 น. (860 vph), ช่วงเร่งด่วนเย็น 17:30 น. (940 vph - คอขวดสูงสุด), ระดับ LOS D/E, ความเร็วเฉลี่ย 36.4 กม./ชม., ดีเลย์ 8.5 นาที, ปล่อยคาร์บอน 1,420.5 kg-CO2/วัน
5. ยุทธศาสตร์ Smart City & EEC Transit: การเชื่อมต่อระบบ Feeder Shuttle สู่ถนนสุขุมวิท, ระบบ Smart Parking Dynamic Guidance, ระบบ EV Charging Hub และการบริหารจัดการคาร์บอน

ข้อกำหนดการตอบ:
- ให้ตอบเป็นภาษาไทยที่สุภาพ เป็นมืออาชีพ กระชับ และตรงประเด็น
- มีการอ้างอิงตัวเลขสถิติจากการสำรวจจริงเพื่อเพิ่มความน่าเชื่อถือ
- หากผู้ใช้ถามข้อเสนอแนะ ให้เสนอแนวทางที่เป็นรูปธรรมและแบ่งเป็นลำดับขั้นตอน (Actionable Insights)`;

    const payload = {
      model: TYPHOON_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...(messages || [])
      ],
      max_tokens: 1500,
      temperature: 0.4
    };

    const response = await fetch(`${TYPHOON_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TYPHOON_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Typhoon API Error]", response.status, errorText);
      return NextResponse.json({ error: "Failed to communicate with Typhoon API", details: errorText }, { status: response.status });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "ขออภัย ไม่สามารถประมวลผลข้อความได้ในขณะนี้";

    return NextResponse.json({ reply, model: TYPHOON_MODEL });
  } catch (error: any) {
    console.error("[Typhoon Route Exception]", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

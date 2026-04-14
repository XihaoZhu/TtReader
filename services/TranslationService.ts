
// const BASE_URL = 'https://marianmt-api.onrender.com';

// export async function translate(text: string): Promise<string[]> {
//     try {


//         const res = await fetch(`${BASE_URL}/translate`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ text }),
//         });

//         if (!res.ok) {
//             return ['Translation service is unavailable at the moment. Please try again later.'];
//         }

//         const data = await res.json();
//         return [data.translation];
//     } catch (err) {
//         console.error("translate error:", err);
//         throw err;
//     }
// }

const BASE_URL = 'https://nickunderdrain-marianmt-entocn.hf.space';

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function translate(text: string): Promise<string[]> {
    try {
        const submitRes = await fetch(
            `${BASE_URL}/gradio_api/call/predict`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    data: [text],
                }),
            }
        );

        if (!submitRes.ok) {
            return ["Service unavailable (submit failed)"];
        }

        const submitData = await submitRes.json();
        const eventId = submitData.event_id;

        if (!eventId) {
            return ["No event_id returned"];
        }

        const resultUrl = `${BASE_URL}/gradio_api/call/predict/${eventId}`;

        for (let i = 0; i < 20; i++) {
            const res = await fetch(resultUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                return ["Polling failed"];
            }

            const text = await res.text();

            if (text.includes("event: complete")) {
                const match = text.match(/data:\s*(\[[\s\S]*\])/);

                if (match) {
                    const data = JSON.parse(match[1]);
                    return [data[0]];
                }
            }

            await sleep(1000);
        }

        return ["Timeout waiting for translation"];

    } catch (err) {
        console.error("translate error:", err);
        return ["Translation error"];
    }
}


const BASE_URL = 'http://192.168.0.110:8000';

export async function translate(text: string): Promise<string[]> {
    try {
        const res = await fetch(`${BASE_URL}/translate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text }),
        });

        if (!res.ok) {
            throw new Error(`HTTP error: ${res.status}`);
        }

        const data = await res.json();
        return [data.translation];
    } catch (err) {
        console.error("translate error:", err);
        throw err;
    }
}
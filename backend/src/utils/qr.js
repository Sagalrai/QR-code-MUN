import QRCode from "qrcode";

export async function generateVolunteerQrCode(url) {
    try {
        return await QRCode.toDataURL(url, {
            errorCorrectionLevel: "M",
            margin: 1,
            width: 420,
            color: {
                dark: "#111827",
                light: "#ffffff",
            },
        });
    } catch (error) {
        throw new Error("Failed to generate QR code");
    }
}

import { decodePrescriptionText } from './services/prescriptionDecoder.js';

// 1x1 pixel black base64 jpeg
const dummyBase64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

async function run() {
    try {
        const result = await decodePrescriptionText(dummyBase64, 'dummy_key', true, 'en');
        console.log("Success:", result);
    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();

const sharp = require('sharp');

module.exports = async (req, res) => {
    // Разрешаем доступ извне (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Укажите ?url=...' });
    }

    try {
        // 1. Качаем изображение
        const response = await fetch(url);
        if (!response.ok) throw new Error('Не удалось скачать фото');
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 2. Обработка через Sharp (режим Nearest для четких пикселей)
        const { data, info } = await sharp(buffer)
            .resize(32, 32, { kernel: 'nearest' })
            .ensureAlpha() 
            .raw()
            .toBuffer({ resolveWithObject: true });

        // 3. Конвертация буфера в массив HEX-строк
        const pixels = [];
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i].toString(16).padStart(2, '0');
            const g = data[i+1].toString(16).padStart(2, '0');
            const b = data[i+2].toString(16).padStart(2, '0');
            pixels.push(`#${r}${g}${b}`);
        }

        // 4. Отправка результата
        res.status(200).json({
            status: "success",
            width: 32,
            height: 32,
            map: pixels
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

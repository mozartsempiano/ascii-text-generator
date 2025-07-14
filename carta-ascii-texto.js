// Function to wrap text into lines
function wrapTextLines(ctx, text, maxWidth) {
  const paragraphs = text.split("\n"); // separate by existing line breaks
  const lines = [];

  paragraphs.forEach((paragraph) => {
    const words = paragraph.split(" ");
    let line = "";

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim()); // add the last line of the paragraph
  });

  return lines;
}

function adicionarRuido(ctx, quantidade) {
  for (let i = 0; i < quantidade; i++) {
    const x = Math.random() * ctx.canvas.width;
    const y = Math.random() * ctx.canvas.height;

    const rx = (Math.floor(Math.random() * 2, 2) + 1) * (0.7 + Math.random() * 0.6); // random X radius
    const ry = (Math.floor(Math.random() * 2, 2) + 1) * (0.7 + Math.random() * 0.6); // random Y radius

    //const tamanho = Math.floor(Math.random() * 4) + 1; // from 1 to 4 pixels
    const angle = Math.random() * Math.PI * 2; // random rotation

    // Choose color: very dark or very light (random)
    const escolha = Math.random();
    let cor;
    if (escolha < 0.5) {
      // dark color
      const tom = Math.floor(115 + Math.random() * (230 - 115)); // Medium to light gray (115 to 200)
      cor = `rgb(${tom}, ${tom}, ${tom})`;
    } else {
      // light color
      const tom = Math.floor(200 + Math.random() * 55); // Light gray to white
      cor = `rgb(${tom}, ${tom}, ${tom})`;
    }

    ctx.fillStyle = cor;
    // ctx.filter = "blur(0.2px)"; // Apply blur
    // ctx.fillRect(x, y, tamanho, tamanho);
    ctx.beginPath();
    // ctx.arc(x, y, tamanho / 2, 0, Math.PI * 2);
    ctx.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2);
    ctx.fill();
  }
}

function adicionarManchas(ctx, quantidade, fontFamily) {
  const caracteres = ["'", ",", "`", "-", "_"];
  const tamanhos = [10, 12, 14, 16];

  for (let i = 0; i < quantidade; i++) {
    const x = Math.random() * ctx.canvas.width;
    const y = Math.random() * ctx.canvas.height;

    const caractere = caracteres[Math.floor(Math.random() * caracteres.length)];
    const tamanho = tamanhos[Math.floor(Math.random() * tamanhos.length)];

    // Subtle opacity, between 0.15 and 0.4
    const opacidade = 0.15 + Math.random() * 0.25;

    // Dark tone
    const tom = Math.floor(40 + Math.random() * (86 - 40)); // 40 to 86
    ctx.fillStyle = `rgba(${tom}, ${tom}, ${tom}, ${opacidade})`;

    ctx.font = `${tamanho}px ${fontFamily}, monospace`;

    // Random rotation between -45 and +45 degrees
    const angulo = ((Math.random() - 0.5) * Math.PI) / 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angulo);
    ctx.filter = "blur(1px)"; // Apply blur
    ctx.fillText(caractere, 0, 0);
    ctx.filter = "none"; // Remove blur for next drawings
    ctx.restore();
  }
}

// ASCII character map, from darkest to lightest
//const asciiChars = "@%#*+=-:. ";
const asciiChars = "%+=*-:. ";

function generateImage() {
  const imageURL = document.getElementById("imageURL").value;
  const text = document.getElementById("textInput").value;

  if (!imageURL) {
    alert("Please enter the image link.");
    return;
  }

  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onload = function () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const asciiWidth = 70; // Fixed width for ASCII art
    const aspectRatio = img.height / img.width;
    const asciiHeight = Math.floor(asciiWidth * aspectRatio);

    // Colors
    const amarelada = `rgb(255, 248, ${Math.floor(Math.random() * (243 - 210 + 1)) + 220})`;
    const corFundo = amarelada;

    // Horizontal and Vertical Padding
    const paddingHorizontal = 75;
    const paddingVertical = 85;

    // Font settings
    const fontSize = 16;
    const fontFamily = "'gabriele-d'";

    // Temporary canvas to resize image
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = asciiWidth;
    tempCanvas.height = asciiHeight;
    tempCtx.drawImage(img, 0, 0, asciiWidth, asciiHeight);

    const imageData = tempCtx.getImageData(0, 0, asciiWidth, asciiHeight);
    const data = imageData.data;

    // --- FIND CONTENT LIMITS (bounding box) ---
    let minX = asciiWidth,
      maxX = 0,
      minY = asciiHeight,
      maxY = 0;
    for (let y = 0; y < asciiHeight; y++) {
      for (let x = 0; x < asciiWidth; x++) {
        const offset = (y * asciiWidth + x) * 4;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        const a = data[offset + 3];

        const isTransparent = a === 0;
        const isWhite = r > 240 && g > 240 && b > 240;

        if (!(isTransparent || isWhite)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (minX > maxX || minY > maxY) {
      minX = 0;
      maxX = asciiWidth - 1;
      minY = 0;
      maxY = asciiHeight - 1;
    }

    // --- Adjustment to center and remove extra space ---
    ctx.font = fontSize + "px " + fontFamily + ", monospace";
    const charWidth = ctx.measureText("M").width;
    const lineHeight = Math.floor(fontSize * 1); // Line height for normal text
    const lineHeightAscii = Math.floor(fontSize * 0.85); // Line height for ASCII art

    const espacoEntreArteETexto = 40;
    const extraWidth = 60;
    const extraHeight = 0;

    const asciiContentWidth = (maxX - minX + 1) * charWidth;
    const asciiContentHeight = (maxY - minY + 1) * lineHeightAscii;

    const textAreaWidth = asciiContentWidth + extraWidth; // or other desired value
    const lines = wrapTextLines(ctx, text, textAreaWidth);
    const textHeight = lines.length * lineHeight;

    // Adjust canvas size
    canvas.width = textAreaWidth + paddingHorizontal * 2 + extraWidth;
    canvas.height = asciiContentHeight + espacoEntreArteETexto + textHeight + paddingVertical * 2 + extraHeight;

    // Now, re-assign the font after changing the canvas size!
    ctx.font = fontSize + "px " + fontFamily + ", monospace";
    ctx.textBaseline = "top";

    const asciiStartX = (canvas.width - textAreaWidth) / 2;
    const asciiStartXascii = (canvas.width - asciiContentWidth) / 2;
    const asciiStartY = paddingVertical;

    // Background
    ctx.fillStyle = corFundo;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- GENERATE ASCII ONLY WITHIN THE BOUNDING BOX ---
    let distorcaoHorizontal = 0.6;
    for (let y = minY; y <= maxY; y++) {
      let shear = (Math.random() - 0.5) * distorcaoHorizontal;
      for (let x = minX; x <= maxX; x++) {
        const offset = (y * asciiWidth + x) * 4;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        const a = data[offset + 3];

        const isTransparent = a === 0;
        const isWhite = r > 240 && g > 240 && b > 240;
        if (isTransparent || isWhite) continue;

        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        const charIndex = Math.floor((luminance / 255) * (asciiChars.length - 1));
        const asciiChar = asciiChars.charAt(charIndex);

        // Color and opacity variation
        let base = 76 + Math.floor(Math.random() * 20) - 10;
        let alpha = 0.82 + Math.random() * 0.18;
        ctx.fillStyle = `rgba(${base},${base - 5},${base - 8},${alpha})`;

        // Misalignment
        let dx = (Math.random() - 0.5) * 1.5;
        let dy = (Math.random() - 0.5) * 1.5;

        ctx.fillText(
          asciiChar,
          asciiStartXascii + (x - minX) * charWidth + dx + shear,
          asciiStartY + (y - minY) * lineHeightAscii + dy
        );
      }
    }

    // --- IRREGULAR BORDER WITH RADIAL GRADIENT ---
    let grad = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2.2,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 1.1
    );
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(60,50,30,0.18)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // "Torn" borders with soft stains
    for (let i = 0; i < 120; i++) {
      let x = Math.random() * canvas.width;
      let y = Math.random() * canvas.height;
      let r = 6 + Math.random() * 12;
      if (x < 30 || x > canvas.width - 30 || y < 30 || y > canvas.height - 30) {
        ctx.globalAlpha = 0.13;
        ctx.fillStyle = "#bba";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // --- SCANNER EFFECT (HORIZONTAL LIGHT BAND) ---
    ctx.globalAlpha = 0.09;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
    ctx.globalAlpha = 1;

    // --- DRAW TEXT BELOW ASCII ART (WITH COLOR, OPACITY, MISALIGNMENT AND DISTORTION VARIATION) ---
    ctx.textAlign = "left";
    let yText = asciiStartY + asciiContentHeight + espacoEntreArteETexto; // Number is the spacing between ASCII art and text
    for (const line of lines) {
      let shear = (Math.random() - 0.5) * distorcaoHorizontal;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        // Color and opacity variation
        let base = 76 + Math.floor(Math.random() * 20) - 10;
        let alpha = 0.82 + Math.random() * 0.18;
        ctx.fillStyle = `rgba(${base},${base - 5},${base - 8},${alpha})`;

        // Misalignment
        let dx = (Math.random() - 0.5) * 1.5;
        let dy = (Math.random() - 0.5) * 1.5;

        ctx.fillText(char, asciiStartX + i * charWidth + dx + shear, yText + dy);
      }
      yText += lineHeight;
    }

    // --- SOFT NOISE OVER THE PAPER ---
    adicionarRuido(ctx, asciiWidth * 1, 2); // asciiWidth 80 equals 100 noises

    // --- STAINS (BLURRED, ROTATED, DARK CHARACTERS) ---
    adicionarManchas(ctx, 50, fontFamily);
  };

  img.onerror = function () {
    alert("Error loading the image. Please check if the link is correct and allows external access.");
  };

  img.src = imageURL;
}

// Function to download the generated image
function downloadImage() {
  const canvas = document.getElementById("canvas");
  const link = document.createElement("a");

  // Generates name in the format YYYYMMDD_HHmmSS
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  const fileName = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(
    now.getMinutes()
  )}${pad(now.getSeconds())}`;

  link.download = `${fileName}.jpg`;
  link.href = canvas.toDataURL("image/jpeg", 0.95); // 1 is 100% quality, 0 is 0%
  link.click();
}

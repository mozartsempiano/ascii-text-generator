// Function to break text into lines
function wrapTextLines(ctx, text, maxWidth) {
	const paragraphs = text.split("\n"); // separate by existing breaks
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
	console.log("[adicionarRuido] quantidade:", quantidade);
	for (let i = 0; i < quantidade; i++) {
		const x = Math.random() * ctx.canvas.width;
		const y = Math.random() * ctx.canvas.height;

		const rx = (Math.floor(Math.random() * 2, 2) + 1) * (0.7 + Math.random() * 0.6); // random X radius
		const ry = (Math.floor(Math.random() * 2, 2) + 1) * (0.7 + Math.random() * 0.6); // random Y radius

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
		ctx.beginPath();
		ctx.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2);
		ctx.fill();
	}
}

function adicionarManchas(ctx, quantidade, fontFamily) {
	console.log("[adicionarManchas] quantidade:", quantidade);
	const caracteres = ["'", ",", "`", "-", "_"];
	const tamanhos = [10, 12, 14, 16];

	for (let i = 0; i < quantidade; i++) {
		const x = Math.random() * ctx.canvas.width;
		const y = Math.random() * ctx.canvas.height;

		const caractere = caracteres[Math.floor(Math.random() * caracteres.length)];
		const tamanho = tamanhos[Math.floor(Math.random() * tamanhos.length)];

		// Opacidade mais visível: 0.25 a 0.55
		const opacidade = 0.25 + Math.random() * 0.3;

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

let asciiChars = "%+=*-:. ";

// Configuration variables and defaults
const configDefaults = {
	fontSize: 18,
	asciiDensity: "%+=*-:. ",
	textDistortion: 1.5,
	noiseAmount: 80,
	stainAmount: 50,
};
let configFontSize = configDefaults.fontSize;
let configNoiseAmount = configDefaults.noiseAmount;
let configStainAmount = configDefaults.stainAmount;
let configTextDistortion = configDefaults.textDistortion;

// Reset simples para cada campo
function setupResetButtons() {
	document.querySelectorAll(".reset-btn").forEach((btn) => {
		btn.addEventListener("click", function () {
			const target = this.dataset.target;
			const def = configDefaults[target];
			const el = document.getElementById(target);
			if (!el) return;
			el.value = def;
			el.dispatchEvent(new Event("input", { bubbles: true }));
			// Atualiza o span de valor, se existir
			const span = document.getElementById(target + "Value");
			if (span) {
				span.textContent = def + (target === "fontSize" ? "px" : "");
			}
		});
	});
}

document.addEventListener("DOMContentLoaded", function () {
	// Font Size
	const fontSizeSlider = document.getElementById("fontSize");
	const fontSizeValue = document.getElementById("fontSizeValue");
	fontSizeSlider.min = 12;
	fontSizeSlider.max = 24;
	fontSizeSlider.value = configDefaults.fontSize;
	fontSizeValue.textContent = configDefaults.fontSize + "px";
	configFontSize = configDefaults.fontSize;

	// ASCII Density
	const asciiDensitySelect = document.getElementById("asciiDensity");
	asciiDensitySelect.value = configDefaults.asciiDensity;
	asciiChars = configDefaults.asciiDensity;

	// Text Distortion
	const distortionSlider = document.getElementById("textDistortion");
	const distortionValue = document.getElementById("textDistortionValue");
	distortionSlider.min = 0;
	distortionSlider.max = 3;
	distortionSlider.step = 0.1;
	distortionSlider.value = configDefaults.textDistortion;
	distortionValue.textContent = configDefaults.textDistortion;
	configTextDistortion = configDefaults.textDistortion;

	// Noise Amount
	const noiseSlider = document.getElementById("noiseAmount");
	const noiseValue = document.getElementById("noiseAmountValue");
	noiseSlider.min = 0;
	noiseSlider.max = 200;
	noiseSlider.value = configDefaults.noiseAmount;
	noiseValue.textContent = configDefaults.noiseAmount;
	configNoiseAmount = configDefaults.noiseAmount;

	// Stain Amount
	const stainSlider = document.getElementById("stainAmount");
	const stainValue = document.getElementById("stainAmountValue");
	stainSlider.min = 0;
	stainSlider.max = 100;
	stainSlider.value = configDefaults.stainAmount;
	stainValue.textContent = configDefaults.stainAmount;
	configStainAmount = configDefaults.stainAmount;

	// Atualiza ao digitar no textarea
	const textInput = document.getElementById("textInput");
	if (textInput) textInput.addEventListener("input", generateImage);

	// Atualiza ao mudar imagem (file ou url)
	const imageFile = document.getElementById("imageFile");
	if (imageFile) imageFile.addEventListener("change", generateImage);
	const imageURL = document.getElementById("imageURL");
	if (imageURL) imageURL.addEventListener("input", generateImage);

	// Painel de configuração: listeners para todos os inputs
	if (fontSizeSlider) {
		fontSizeSlider.addEventListener("input", function () {
			configFontSize = parseInt(this.value, 10);
			fontSizeValue.textContent = this.value + "px";
			generateImage();
		});
	}
	if (asciiDensitySelect) {
		asciiDensitySelect.addEventListener("change", function () {
			asciiChars = this.value;
			generateImage();
		});
	}
	if (distortionSlider) {
		distortionSlider.addEventListener("input", function () {
			configTextDistortion = parseFloat(this.value);
			distortionValue.textContent = this.value;
			generateImage();
		});
	}
	if (noiseSlider) {
		noiseSlider.addEventListener("input", function () {
			configNoiseAmount = parseInt(this.value, 10);
			noiseValue.textContent = this.value;
			generateImage();
		});
	}
	if (stainSlider) {
		stainSlider.addEventListener("input", function () {
			configStainAmount = parseInt(this.value, 10);
			stainValue.textContent = this.value;
			console.log("[slider input] stainAmount:", this.value, "configStainAmount:", configStainAmount);
			generateImage();
		});
	}

	setupResetButtons();
});

function generateImage() {
	const fileInput = document.getElementById("imageFile");
	const imageURL = document.getElementById("imageURL").value;
	const text = document.getElementById("textInput").value;

	// Validate that we have at least text if no image
	const fileCheck = fileInput && fileInput.files && fileInput.files[0];
	if (!fileCheck && !imageURL && !text.trim()) {
		alert("Please enter some text or provide an image.");
		return;
	}

	// Helper: processes an already loaded Image (same logic as in img.onload)
	function processLoadedImage(img) {
		// Sempre pega o valor atual do slider de manchas (nomes únicos)
		const stainSliderProcess = document.getElementById("stainAmount");
		let stainAmountAtualProcess = 0;
		if (stainSliderProcess) {
			stainAmountAtualProcess = parseInt(stainSliderProcess.value, 10) || 0;
		}
		console.log("[generateImage] stainSlider.value:", stainSliderProcess ? stainSliderProcess.value : "N/A", "stainAmountAtual:", stainAmountAtualProcess);
		// Sempre pega o valor atual do slider de manchas
		const stainSlider = document.getElementById("stainAmount");
		let stainAmountAtual = 0;
		if (stainSlider) {
			stainAmountAtual = parseInt(stainSlider.value, 10) || 0;
		}
		// Disable button while processing
		const genBtn = document.getElementById("generate-btn");
		if (genBtn) {
			genBtn.disabled = true;
			genBtn.dataset.orig = genBtn.innerText;
			genBtn.innerText = "Generating...";
		}
		const canvas = document.getElementById("canvas");
		const ctx = canvas.getContext("2d");

		// Define font settings FIRST for all cases
		const fontSize = configFontSize; // Use configuration value
		const fontFamily = "'gabriele-d'";
		const lineHeight = Math.floor(fontSize * 1);

		// Set font immediately
		ctx.font = fontSize + "px " + fontFamily + ", monospace";
		ctx.textBaseline = "top";

		// If no image, just render text
		if (!img) {
			// Calculate charWidth same as with image (outside the loop)
			const charWidth = ctx.measureText("M").width;

			// Fixed width for all cases
			const textAreaWidth = 1238 - 150 - 60; // 1238 total - paddings - extra
			const lines = wrapTextLines(ctx, text, textAreaWidth);
			const textHeight = lines.length * lineHeight;

			// Fixed canvas width
			canvas.width = 1238;
			canvas.height = textHeight + 170 + 0; // paddingVertical * 2 + extraHeight

			// Re-set font after canvas resize
			ctx.font = fontSize + "px " + fontFamily + ", monospace";
			ctx.textBaseline = "top";

			// Background
			const corFundo = `rgb(255, 248, ${Math.floor(Math.random() * (243 - 210 + 1)) + 220})`;
			ctx.fillStyle = corFundo;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Calculate text dimensions for centering
			const totalTextHeight = lines.length * lineHeight;

			// Draw text with typewriter effect (same as with image)
			ctx.textAlign = "left";
			const startX = (1238 - textAreaWidth) / 2; // Center text in fixed width
			const paddingVertical = (canvas.height - totalTextHeight) / 2; // Center vertically

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				const lineY = paddingVertical + i * lineHeight;

				// Draw each character with slight variations for typewriter effect
				for (let charIndex = 0; charIndex < line.length; charIndex++) {
					const char = line[charIndex];

					// Color and opacity variation
					let base = 76 + Math.floor(Math.random() * 20) - 10;
					let alpha = 0.82 + Math.random() * 0.18;
					ctx.fillStyle = `rgba(${base},${base - 5},${base - 8},${alpha})`;

					// Misalignment
					let dx = (Math.random() - 0.5) * configTextDistortion; // Use configuration value
					let dy = (Math.random() - 0.5) * configTextDistortion;

					const charX = startX + charIndex * charWidth + dx;

					ctx.fillText(char, charX, lineY + dy);
				}
			}

			// Add vintage effects (same as with image)
			// --- IRREGULAR BORDER WITH RADIAL GRADIENT ---
			let grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.width / 2.2, canvas.width / 2, canvas.height / 2, canvas.width / 1.1);
			grad.addColorStop(0, "rgba(0,0,0,0)");
			grad.addColorStop(1, "rgba(60,50,30,0.18)");
			ctx.globalAlpha = 1;
			ctx.fillStyle = grad;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// "Torn" borders with soft stains
			for (let i = 0; i < stainAmountAtualProcess; i++) {
				let x = Math.random() * canvas.width;
				let y = Math.random() * canvas.height;
				let r = 6 + Math.random() * 12;
				if (x < 30 || x > canvas.width - 30 || y < 30 || y > canvas.height - 30) {
					ctx.globalAlpha = 0.2; // Increased opacity for more visible stains
					ctx.fillStyle = "#bba";
					ctx.beginPath();
					ctx.arc(x, y, r, 0, Math.PI * 2);
					ctx.fill();
				}
			}

			// Additional scattered stains throughout the canvas
			for (let i = 0; i < stainAmountAtualProcess; i++) {
				let x = Math.random() * canvas.width;
				let y = Math.random() * canvas.height;
				let r = 3 + Math.random() * 8;
				ctx.globalAlpha = 0.08 + Math.random() * 0.15; // Variable opacity
				const grayTone = 180 + Math.random() * 40; // Light gray variations
				ctx.fillStyle = `rgb(${grayTone}, ${grayTone}, ${grayTone})`;
				ctx.beginPath();
				ctx.arc(x, y, r, 0, Math.PI * 2);
				ctx.fill();
			}

			// --- SCANNER EFFECT (HORIZONTAL LIGHT BAND) ---
			ctx.globalAlpha = 0.09;
			ctx.fillStyle = "#fff";
			ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
			ctx.globalAlpha = 1;

			// --- SOFT NOISE OVER PAPER ---
			adicionarRuido(ctx, configNoiseAmount); // Use configuration value

			// --- STAINS (BLURRED, ROTATED, DARK CHARACTERS) ---
			console.log("[processLoadedImage] (text only) stainAmountAtual:", stainAmountAtualProcess);
			adicionarManchas(ctx, stainAmountAtualProcess, fontFamily); // Usa valor atual do slider

			// Re-enable button
			if (genBtn) {
				genBtn.disabled = false;
				genBtn.innerText = genBtn.dataset.orig || "Generate Image";
			}
			return;
		}

		const asciiWidth = 70; // Fixed width for ASCII art
		const aspectRatio = img.height / img.width;
		const asciiHeight = Math.floor(asciiWidth * aspectRatio);

		// Colors
		const amarelada = `rgb(255, 248, ${Math.floor(Math.random() * (243 - 210 + 1)) + 220})`;
		const corFundo = amarelada;

		// Horizontal and Vertical Padding
		const paddingHorizontal = 75;
		const paddingVertical = 85;

		// Temporary canvas to resize image
		const tempCanvas = document.createElement("canvas");
		const tempCtx = tempCanvas.getContext("2d");
		tempCanvas.width = asciiWidth;
		tempCanvas.height = asciiHeight;
		tempCtx.drawImage(img, 0, 0, asciiWidth, asciiHeight);

		const imageData = tempCtx.getImageData(0, 0, asciiWidth, asciiHeight);
		const data = imageData.data;

		// --- FIND CONTENT BOUNDS (bounding box) ---
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
		const lineHeightAscii = Math.floor(fontSize * 0.85); // Line height for ASCII art

		const espacoEntreArteETexto = 40;
		const extraWidth = 60;
		const extraHeight = 0;

		const asciiContentWidth = (maxX - minX + 1) * charWidth;
		const asciiContentHeight = (maxY - minY + 1) * lineHeightAscii;

		const textAreaWidth = 1238 - 150 - 60; // Same as text-only mode for consistency
		const lines = wrapTextLines(ctx, text, textAreaWidth);
		const textHeight = lines.length * lineHeight;

		// Adjust canvas size - FIXED WIDTH FOR ALL CASES
		canvas.width = 1238;
		canvas.height = asciiContentHeight + espacoEntreArteETexto + textHeight + paddingVertical * 2 + extraHeight;

		// Now, re-assign the font after changing canvas size!
		ctx.font = fontSize + "px " + fontFamily + ", monospace";
		ctx.textBaseline = "top";

		const asciiStartX = (1238 - textAreaWidth) / 2; // Use fixed width like text-only mode
		const asciiStartXascii = (canvas.width - asciiContentWidth) / 2;
		const asciiStartY = paddingVertical;

		// Background
		ctx.fillStyle = corFundo;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// --- GENERATE ASCII ONLY WITHIN BOUNDING BOX ---
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
				let dx = (Math.random() - 0.5) * configTextDistortion; // Use configuration value
				let dy = (Math.random() - 0.5) * configTextDistortion;

				ctx.fillText(asciiChar, asciiStartXascii + (x - minX) * charWidth + dx + shear, asciiStartY + (y - minY) * lineHeightAscii + dy);
			}
		}

		// --- IRREGULAR BORDER WITH RADIAL GRADIENT ---
		let grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.width / 2.2, canvas.width / 2, canvas.height / 2, canvas.width / 1.1);
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
				ctx.globalAlpha = 0.25; // Increased opacity for more visible stains
				ctx.fillStyle = "#bba";
				ctx.beginPath();
				ctx.arc(x, y, r, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		// Additional scattered stains throughout the canvas
		for (let i = 0; i < 40; i++) {
			let x = Math.random() * canvas.width;
			let y = Math.random() * canvas.height;
			let r = 3 + Math.random() * 8;
			ctx.globalAlpha = 0.08 + Math.random() * 0.15; // Variable opacity
			const grayTone = 180 + Math.random() * 40; // Light gray variations
			ctx.fillStyle = `rgb(${grayTone}, ${grayTone}, ${grayTone})`;
			ctx.beginPath();
			ctx.arc(x, y, r, 0, Math.PI * 2);
			ctx.fill();
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
				let dx = (Math.random() - 0.5) * configTextDistortion; // Use configuration value
				let dy = (Math.random() - 0.5) * configTextDistortion;

				ctx.fillText(char, asciiStartX + i * charWidth + dx + shear, yText + dy);
			}
			yText += lineHeight;
		}

		// --- SOFT NOISE OVER PAPER ---
		adicionarRuido(ctx, configNoiseAmount); // Use configuration value

		// --- STAINS (BLURRED, ROTATED, DARK CHARACTERS) ---
		console.log("[processLoadedImage] (image) stainAmountAtual:", stainAmountAtualProcess);
		adicionarManchas(ctx, stainAmountAtualProcess, fontFamily); // Usa valor atual do slider
		// re-enable button
		if (genBtn) {
			genBtn.disabled = false;
			genBtn.innerText = genBtn.dataset.orig || "Generate Image";
		}
	}

	// Decide between using local file (file input) or URL
	const img = new Image();
	const file = fileInput && fileInput.files && fileInput.files[0];
	if (file) {
		if (!file.type.startsWith("image/")) {
			alert("Please upload a valid image file.");
			return;
		}
		const reader = new FileReader();
		reader.onload = function (e) {
			img.onload = function () {
				processLoadedImage(img);
			};
			img.onerror = function () {
				alert("Error processing the uploaded image.");
			};
			img.src = e.target.result;
		};
		reader.readAsDataURL(file);
	} else {
		if (!imageURL) {
			// Process without image - create text-only version
			processLoadedImage(null);
			return;
		}
		img.crossOrigin = "anonymous";
		img.onload = function () {
			processLoadedImage(img);
		};
		img.onerror = function () {
			alert("Error loading image. Check if the link is correct and allows external access.");
		};
		img.src = imageURL;
	}
}

// Function to download the generated image
function downloadImage() {
	const canvas = document.getElementById("canvas");
	const link = document.createElement("a");
	const format = (document.getElementById("downloadFormat")?.value || "jpg").toLowerCase();
	let mimeType = "image/jpeg";
	let ext = "jpg";
	let quality = 0.92;
	if (format === "png") {
		mimeType = "image/png";
		ext = "png";
		quality = 1.0;
	} else if (format === "webp") {
		mimeType = "image/webp";
		ext = "webp";
		quality = 1.0;
	}
	// Generate filename in YYYYMMDD_HHmmSS format
	const now = new Date();
	const pad = (n) => n.toString().padStart(2, "0");
	const fileName = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
	link.download = `${fileName}.${ext}`;
	link.href = canvas.toDataURL(mimeType, quality);
	link.click();
}

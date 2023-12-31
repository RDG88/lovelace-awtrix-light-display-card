class AwtrixLightDisplayCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.card = document.createElement('ha-card'); // Create the ha-card element
    this.content = document.createElement('div');
    this.card.appendChild(this.content); // Add the content to the ha-card
    this.shadowRoot.appendChild(this.card); // Add the ha-card to the shadow root
    this.currentSvg = null;
    this.defaultWidth = 256;
    this.defaultHeight = 64;
  }

  setConfig(config) {
    this.config = {
      resolution: '256x64',
      matrix_padding: 1,
      border_radius: 10, // Default border radius is 10
      border_width: 3, // Default SVG border width is 0
      border_color: 'white', // Default SVG border color is white
      ...config,
    };
  }

  set hass(hass) {
    if (
      this.config &&
      this.config.sensor &&
      hass.states[this.config.sensor]
    ) {
      const sensor = this.config.sensor;
      const matrix_padding = parseInt(this.config.matrix_padding) || 1;

      const sensorData = hass.states[sensor].attributes.screen;
      if (!sensorData) {
        // Invalid sensor data, display the provided picture data
        this.createSvgElementWithPictureData(matrix_padding);
        return;
      }

      const pixelData = JSON.parse(sensorData);
      if (!Array.isArray(pixelData)) {
        // Invalid sensor data, display the provided picture data
        this.createSvgElementWithPictureData(matrix_padding);
        return;
      }

      // Check if pixelData has changed since the last update
      const isNewData = this.hasPixelDataChanged(pixelData);

      if (!this.currentSvg || isNewData) {
        // If currentSvg is not defined or the data has changed, create/update the SVG
        const svg = this.createSvgElement(pixelData, matrix_padding);

        if (this.currentSvg && isNewData) {
          // Only replace the SVG if the data has changed
          this.content.replaceChild(svg, this.currentSvg);
        } else if (!this.currentSvg) {
          // If currentSvg is not defined, create the initial SVG
          this.content.appendChild(svg);
        }

        this.currentSvg = svg;
      }
    } else {
      // Sensor not configured or not found, display the provided picture data
      const matrix_padding = 1;
      this.createSvgElementWithPictureData(matrix_padding);
    }
  }

  hasPixelDataChanged(newPixelData) {
    if (!this.currentSvg) return true; // If currentSvg is not defined, consider it as new data

    // Compare the pixelData arrays to check if there are any differences
    return JSON.stringify(newPixelData) !== JSON.stringify(this.getPixelDataFromSvg());
  }

  getPixelDataFromSvg() {
    // Extract the pixelData from the current SVG
    const pixelData = [];
    const svgPixels = this.currentSvg.getElementsByTagName('rect');
    for (let i = 0; i < svgPixels.length; i++) {
      const pixelColor = svgPixels[i].getAttribute('fill');
      const [r, g, b] = pixelColor.match(/\d+/g);
      const rgb565 = ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3);
      pixelData.push(rgb565);
    }
    return pixelData;
  }


  createSvgElement(pixelData, matrix_padding) {
    const resolutionParts = this.config.resolution.split('x');
    const width = parseInt(resolutionParts[0]) || this.defaultWidth;
    const height = parseInt(resolutionParts[1]) || this.defaultHeight;
    const scaleX = width / 32;
    const scaleY = height / 8;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const borderWidth = this.config.border_width; // SVG border width from config
    const borderColor = this.config.border_color; // SVG border color from config
    const matrixPadding = this.config.matrix_padding; // Matrix padding from config
    const cornerRadius = parseInt(this.config.border_radius); // cornerRadius from config

    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.style.display = 'block';
    svg.style.width = '100%';
    svg.style.height = '100%';
    if (cornerRadius > 0) {
      svg.style.borderRadius = `${cornerRadius}px`;
    }
    if (borderWidth > 0) {
    // Add a border to the SVG
      svg.style.border = `${borderWidth}px solid ${borderColor}`;
    }
    // Include the border and padding in the SVG's
    svg.style.boxSizing = "border-box";


    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 32; x++) {
        const pixelIndex = y * 32 + x;
        const rgb565 = pixelData[pixelIndex];
        const red = ((rgb565 >> 16) & 0xFF);
        const green = ((rgb565 >> 8) & 0xFF);
        const blue = (rgb565 & 0xFF);

        const svgPixel = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        svgPixel.setAttribute('x', x * scaleX);
        svgPixel.setAttribute('y', y * scaleY);
        svgPixel.setAttribute('width', scaleX);
        svgPixel.setAttribute('height', scaleY);
        svgPixel.setAttribute('fill', `rgb(${red},${green},${blue})`);

        // Add the matrix_padding attribute to represent the border around the rectangle (pixel)
        if (matrixPadding > 0) {
          svgPixel.setAttribute('stroke', 'black');
          svgPixel.setAttribute('stroke-width', matrixPadding);
        }
        svg.appendChild(svgPixel);
      }
    }

    return svg;
  }

  createSvgElementWithPictureData(matrix_padding) {
    // If the sensor data is empty, show this:
    const pictureData = [
      // Your previous picture data goes here
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      16711680, 0, 0, 16711680, 0, 0, 16711680, 0, 0, 0, 0, 16711680, 16711680, 0, 0, 16711680, 16711680, 0,
      0, 16711680, 16711680, 16711680, 0, 16711680, 16711680, 0, 0, 0, 0, 0, 0, 0, 16711680, 16711680, 0,
      16711680, 0, 16711680, 0, 16711680, 0, 0, 0, 16711680, 0, 16711680, 0, 16711680, 0, 16711680, 0, 0,
      16711680, 0, 0, 16711680, 0, 16711680, 0, 0, 0, 0, 0, 0, 16711680, 0, 16711680, 16711680, 0, 16711680,
      0, 16711680, 0, 0, 0, 16711680, 0, 16711680, 0, 16711680, 16711680, 16711680, 0, 0, 16711680, 0, 0,
      16711680, 16711680, 16711680, 0, 0, 0, 0, 0, 0, 16711680, 0, 0, 16711680, 0, 16711680, 0, 16711680,
      0, 0, 0, 16711680, 0, 16711680, 0, 16711680, 0, 16711680, 0, 0, 16711680, 0, 0, 16711680, 0,
      16711680, 0, 0, 0, 0, 0, 0, 16711680, 0, 0, 16711680, 0, 0, 16711680, 0, 0, 0, 0, 16711680,
      16711680, 0, 0, 16711680, 0, 16711680, 0, 0, 16711680, 0, 0, 16711680, 0, 16711680, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
    const svg = this.createSvgElement(pictureData, matrix_padding);
    if (this.currentSvg) {
      // If there was a previous SVG, replace it with the picture SVG
      this.content.replaceChild(svg, this.currentSvg);
    } else {
      // If there was no previous SVG, create the initial SVG with the picture data
      this.content.appendChild(svg);
    }

    this.currentSvg = svg;
  }
}

customElements.define('awtrix-light-display-card', AwtrixLightDisplayCard);
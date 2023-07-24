class AwtrixLightDisplayCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.content = document.createElement('div');
    this.shadowRoot.appendChild(this.content);
    this.currentSvg = null; // Store the current SVG for comparison

    // Define the default width and height
    this.defaultWidth = 256;
    this.defaultHeight = 64;
  }

  setConfig(config) {
    this.config = {
      widthHeight: '256x64', // Default value for width and height
      ...config,
    };
  }

  set hass(hass) {
    if (
      this.config &&
      this.config.sensorEntity &&
      hass.states[this.config.sensorEntity]
    ) {
      const sensorEntity = this.config.sensorEntity;
      const borderWidth = parseInt(this.config.borderWidth) || 1;

      const pixelData = JSON.parse(hass.states[sensorEntity].attributes.sensor_attribute);
      if (!Array.isArray(pixelData)) {
        this.content.innerHTML = '<div style="color: red;">Invalid sensor attribute data format.</div>';
        return;
      }

      // Check if pixelData has changed since the last update
      const isNewData = this.hasPixelDataChanged(pixelData);

      if (!this.currentSvg || isNewData) {
        // If currentSvg is not defined or the data has changed, create/update the SVG
        const svg = this.createSvgElement(pixelData, borderWidth);

        if (this.currentSvg && isNewData) {
          // Only replace the SVG if the data has changed
          this.content.replaceChild(svg, this.currentSvg);
        } else if (!this.currentSvg) {
          // If currentSvg is not defined, create the initial SVG
          this.content.appendChild(svg);
        }

        this.currentSvg = svg;
      }
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

  createSvgElement(pixelData, borderWidth) {
    const widthHeightParts = this.config.widthHeight.split('x');
    const width = parseInt(widthHeightParts[0]) || this.defaultWidth;
    const height = parseInt(widthHeightParts[1]) || this.defaultHeight;
    const scaleX = width / 32;
    const scaleY = height / 8;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);

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

        // Add the borderWidth attribute to represent the border around the rectangle (pixel)
        svgPixel.setAttribute('stroke', 'black');
        svgPixel.setAttribute('stroke-width', borderWidth);

        svg.appendChild(svgPixel);
      }
    }

    return svg;
  }
}

customElements.define('awtrix-light-display-card', AwtrixLightDisplayCard);

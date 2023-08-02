class AwtrixLightDisplayCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.initElements();
    this.setDefaults();
  }

  initElements() {
    this.card = document.createElement('ha-card'); 
    this.content = document.createElement('div');
    this.card.appendChild(this.content);
    this.shadowRoot.appendChild(this.card);
  }

  setDefaults() {
    this.currentSvg = null;
    this.defaultWidth = 256;
    this.defaultHeight = 64;
  }

  setConfig(config) {
    this.config = {
      resolution: '256x64',
      matrix_padding: 1,
      border_radius: 10,
      border_width: 3,
      border_color: 'white',
      ...config,
    };
  }

  set hass(hass) {
    const matrix_padding = parseInt(this.config.matrix_padding) || 1;
    if (this.isSensorDataValid(hass)) {
      this.processSensorData(hass, matrix_padding);
    } else {
      this.createSvgElementWithPictureData(matrix_padding);
    }
  }

  isSensorDataValid(hass) {
    return this.config &&
      this.config.sensor &&
      hass.states[this.config.sensor] &&
      hass.states[this.config.sensor].attributes.screen;
  }

  processSensorData(hass, matrix_padding) {
    const sensorData = hass.states[this.config.sensor].attributes.screen;
    const pixelData = JSON.parse(sensorData);
    
    if (!Array.isArray(pixelData)) {
      this.createSvgElementWithPictureData(matrix_padding);
      return;
    }
    
    if (this.isNewPixelData(pixelData)) {
      const svg = this.createSvgElement(pixelData, matrix_padding);
      this.replaceOrCreateSvg(svg);
    }
  }

  isNewPixelData(newPixelData) {
    return !this.currentSvg || JSON.stringify(newPixelData) !== JSON.stringify(this.getPixelDataFromSvg());
  }

  getPixelDataFromSvg() {
    const pixelData = Array.from(this.currentSvg.getElementsByTagName('rect'))
      .map(svgPixel => {
        const pixelColor = svgPixel.getAttribute('fill');
        const [r, g, b] = pixelColor.match(/\d+/g);
        return ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3);
      });
    return pixelData;
  }

  replaceOrCreateSvg(svg) {
    if (this.currentSvg) {
      this.content.replaceChild(svg, this.currentSvg);
    } else {
      this.content.appendChild(svg);
    }
    this.currentSvg = svg;
  }

  createSvgElement(pixelData, matrix_padding) {
    const [width, height] = this.getDimensions();
    const [scaleX, scaleY] = [width / 32, height / 8];
    const svg = this.initializeSvg(width, height);

    pixelData.forEach((rgb565, pixelIndex) => {
      const [x, y] = [pixelIndex % 32, Math.floor(pixelIndex / 32)];
      const [red, green, blue] = this.getRGBColors(rgb565);
      const svgPixel = this.createSvgPixel(scaleX, scaleY, x, y, red, green, blue, matrix_padding);
      svg.appendChild(svgPixel);
    });

    return svg;
  }

  getDimensions() {
    const resolutionParts = this.config.resolution.split('x');
    const width = parseInt(resolutionParts[0]) || this.defaultWidth;
    const height = parseInt(resolutionParts[1]) || this.defaultHeight;
    return [width, height];
  }

  initializeSvg(width, height) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const { border_width, border_color, matrix_padding, border_radius } = this.config;

    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style = `display: block; width: 100%; height: 100%; border: ${border_width}px solid ${border_color}; 
                 boxSizing: border-box; borderRadius: ${border_radius}px;`;

    return svg;
  }

  getRGBColors(rgb565) {
    const red = (rgb565 >> 16) & 0xFF;
    const green = (rgb565 >> 8) & 0xFF;
    const blue = rgb565 & 0xFF;
    return [red, green, blue];
  }

  createSvgPixel(scaleX, scaleY, x, y, red, green, blue, matrix_padding) {
    const svgPixel = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    svgPixel.setAttribute('x', x * scaleX);
    svgPixel.setAttribute('y', y * scaleY);
    svgPixel.setAttribute('width', scaleX);
    svgPixel.setAttribute('height', scaleY);
    svgPixel.setAttribute('fill', `rgb(${red},${green},${blue})`);

    if (matrix_padding > 0) {
      svgPixel.setAttribute('stroke', 'black');
      svgPixel.setAttribute('stroke-width', matrix_padding);
    }

    return svgPixel;
  }

  createSvgElementWithPictureData(matrix_padding) {
    const pictureData = [
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
    this.replaceOrCreateSvg(svg);
  }
}

customElements.define('awtrix-light-display-card', AwtrixLightDisplayCard);
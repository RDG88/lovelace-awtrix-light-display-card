import {
    LitElement,
    html,
    css,
  } from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";
  import { fireEvent } from "./utils.js";
  
  const SCHEMA = [
    { name: "sensor", selector: { entity: { domain: "sensor" } } },
    { name: "bordersize", selector: { number: { min: 0 } } },
    { name: "resolution", selector: { text: {} } },
    // Add more properties and their corresponding selectors as needed
  ];
  
  class AwtrixLightDisplayCardEditor extends LitElement {
    static properties = {
      hass: {},
      _config: {},
    };
  
    setConfig(config) {
      this._config = config;
    }
  
    render() {
      if (!this.hass || !this._config) {
        return html``;
      }
  
      return html`
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${SCHEMA}
          .computeLabel=${this._computeLabelCallback}
          @value-changed=${this._valueChanged}
        />
      `;
    }
  
    _valueChanged = (ev) =>
      fireEvent(this, "config-changed", { config: ev.detail.value });
  
    _computeLabelCallback = (schema) => {
      const { name } = schema;
      switch (name) {
        case "sensor":
          return "Sensor";
        case "bordersize":
          return "Border Size";
        case "resolution":
          return "Resolution";
        default:
          return `Unknown Property`;
      }
    };
  
    static styles = css`
      /* Add your custom styles for the editor here */
    `;
  }
  
  customElements.define(
    "awtrix-light-display-card-editor",
    AwtrixLightDisplayCardEditor
  );
  
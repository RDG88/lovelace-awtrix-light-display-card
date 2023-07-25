
# AWTRIX Light Display Card #

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

<img src="https://raw.githubusercontent.com/RDG88/lovelace-awtrix-light-display-card/main/awtrix.png">

```yaml
resources:
  - url: /hacsfiles/awtrix-light-display-card/awtrix-light-display-card.js
    type: module
```

Configuration is very easy and can be done via the code editor.

To obtain data from the Awtrix Light /api/screen endpoint into a sensor, you need to create a manual command_line sensor:

Example entry for the command_line sensor:
The `scan_interval` in this example is set to 0.5 seconds. Please be cautious as it could potentially overload AWTRIX. Use it with care.
Update the awtrixip in the command with the IP address of your Awtrix Light.

```yaml
command_line:
  - sensor:
      name: awtrix_screenshot
      scan_interval: 0.5
      command: >-
        echo "{\"screen\": \"$(curl --silent --max-time 10 http://awtrixip/api/screen)\"}"
      unique_id: awtrix_screenshot
      value_template: "1"
      json_attributes:
        - screen
      command_timeout: 10
```


|        Name        |                        Description                        |             Required             |
| ------------------ | --------------------------------------------------------- | -------------------------------- |
| `type`             | Cart type (custom:awtrix-light-display-card)              | yes                              |
| `sensor`           | The name of the command_line sensor you created           | yes                              |
| `resolution`       | Resolution of the image                                   | no                               |
| `bordersize`       | Border size in between of the pixels                      | no                               |


Example:

```yaml
type: custom:awtrix-light-display-card
sensor: sensor.awtrix_screenshot
resolution: 512x128
bordersize: 1
```


# you are also welcome to contribute #
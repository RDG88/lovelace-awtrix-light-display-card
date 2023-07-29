
# AWTRIX Light Display Card #

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

![](https://raw.githubusercontent.com/RDG88/lovelace-awtrix-light-display-card/main/images/awtrix_screenshot.svg)

This is a card that mirrors your AWTRIX light to Home Assistant.

Configuration is straightforward and can be done via the code editor.

To fetch data from the AWTRIX Light /api/screen API endpoint into a sensor, you need to create a manual command_line sensor:

## Sensor configuration

Example entry for the command_line sensor:
The scan_interval in this example is set to 0.5 seconds. Please be cautious as it could potentially overload AWTRIX. Use it with care.
Update the awtrixip in the command with the IP address of your AWTRIX Light.

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

## Card configuration

|        Name        |                        Description                        |             Required             |
| ------------------ | --------------------------------------------------------- | -------------------------------- |
| `type`             | Cart type (custom:awtrix-light-display-card)              | yes                              |
| `sensor`           | The name of the command_line sensor you created           | yes                              |
| `resolution`       | Resolution of the image                                   | no                               |
| `bordersize`       | Border size in between of the pixels                      | no                               |
| `borderradius`     | Configure the border radius for the complete image        | no                               |

Example:

```yaml
type: custom:awtrix-light-display-card
sensor: sensor.awtrix_screenshot
resolution: 256x64
bordersize: 1
borderradius: 10
```


## Troubleshooting

When the sensor is not good configured inside the card or the sensor is not recieving the approperiate data the card will display a default generated image:  

![](https://raw.githubusercontent.com/RDG88/lovelace-awtrix-light-display-card/main/images/awtrix_nodata.svg)

The sensor should have a attribute named screen:

![](https://raw.githubusercontent.com/RDG88/lovelace-awtrix-light-display-card/main/images/awtrix_sensor_screenshot.png)


# YOU are welcome to contribute #
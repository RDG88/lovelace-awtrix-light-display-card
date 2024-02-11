
# AWTRIX Light Display Card #

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

![](https://raw.githubusercontent.com/RDG88/lovelace-awtrix-light-display-card/main/images/awtrix_screenshot.svg)

This card enables you to display your AWTRIX light on Home Assistant. 

Configuration is intuitive and easily managed via the code editor.

The card requires a sensor that extracts the RGB array from all pixels displayed on AWTRIX, visible in the `screen` attribute. There are two suggested methods for acquiring this array - via MQTT, the most reliable method, or a command_line sensor that interacts with the API.

Please exercise caution as improper use could potentially overload your AWTRIX!.

## Sensor configuration



### MQTT

Get the screen info into a sensor via a mqtt topic.

This involved 2 parts:

Part1: Create an automation who send an empty message to awtrixtopic/sendscreen   

Modify the `awtrixtopic` with ur own awtrixtopic value, this value can be found in the AWTRIX Web interface -> MQTT -> Prefix.

```yaml
alias: Screenshot every 10 seconds
description: ""
trigger:
  - platform: time_pattern
    seconds: /10
condition: []
action:
  - service: mqtt.publish
    data:
      topic: awtrixtopic/sendscreen
mode: single
```

Part2: Create a MQTT sensor who reads the topic awtrixtopic/screen

Modify the `awtrixtopic` with ur own awtrixtopic value, this value can be found in the AWTRIX Web interface -> MQTT -> Prefix.

```yaml
mqtt:
  sensor:
    - name: "awtrix_screenshot"
      unique_id: "awtrix_screenshot"
      state_topic: "awtrixtopic/screen"
      value_template: "1"
      json_attributes_topic: "awtrixtopic/screen"
      json_attributes_template: "{\"screen\": \"{{ value_json }}\"}"
```

### API

Get the screen info into a sensor via a command_line sensor (less preferable way):

Modify the `awtrixip` with ur own awtrix ip address.

```yaml
command_line:
  - sensor:
      name: awtrix_screenshot
      scan_interval: 10
      command: >-
        echo "{\"screen\": \"$(curl --silent --max-time 10 http://awtrixip/api/screen)\"}"
      unique_id: awtrix_screenshot
      value_template: "1"
      json_attributes:
        - screen
      command_timeout: 10
```

## Card configuration

|        Name        |                        Description                         | Required | Default |
| ------------------ | ---------------------------------------------------------- | -------- | --------|
| `type`             | Cart type (custom:awtrix-light-display-card)               | yes      | n/a     |
| `sensor`           | The name of the mqtt or command_line sensor you created    | yes      | n/a     |
| `resolution`       | Resolution of the image                                    | no       | 256x64  |
| `matrix_padding`   | Matrix padding pixel size                                  | no       | 1       |
| `border_radius`    | Configure the border radius for the image                  | no       | 10      |
| `border_width`     | Border width around the image                              | no       | 3       |
| `border_color`     | Border color around the image                              | no       | white   |


Basic example:

```yaml
type: custom:awtrix-light-display-card
sensor: sensor.awtrix_screenshot
```

Advanced example:

```yaml
type: custom:awtrix-light-display-card
sensor: sensor.awtrix_screenshot
resolution: 256x64
matrix_padding: 1
border_radius: 10
border_width: 3
border_color: white
```


## Troubleshooting

When the sensor is not good configured inside the card or the sensor is not recieving the approperiate data the card will display a default generated image:  

![](https://raw.githubusercontent.com/RDG88/lovelace-awtrix-light-display-card/main/images/awtrix_nodata.svg)

The sensor should have a attribute named screen:

![](https://raw.githubusercontent.com/RDG88/lovelace-awtrix-light-display-card/main/images/awtrix_sensor_screenshot.png)


# YOU are welcome to contribute #

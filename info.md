# lovelace-awtrix-light-display-card


command line sensor config:


command_line:
  - sensor:
      name: ulanzi3_screenshot
      scan_interval: 0.5
      command: >-
        echo "{\"screen\": \"$(curl --silent --max-time 10 http://ulanzi3.graafnet.nl/api/screen)\"}"
      unique_id: ulanzi3_screenshot
      value_template: "1"
      json_attributes:
        - screen
      command_timeout: 10


type: custom:awtrix-light-display-card
sensor: sensor.ulanzi3_screenshot_2
resolution: 512x128
bordersize: 1
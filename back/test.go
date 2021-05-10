package main

import (
    "github.com/gorilla/websocket"
    "github.com/labstack/echo"
    "github.com/labstack/echo/middleware"
    "github.com/labstack/gommon/log"
    "github.com/paulmach/go.geojson"
    "net/http"
    "time"
)

var upgrader = websocket.Upgrader{}

func main() {
    e := echo.New()
    e.Use(middleware.Logger())
    e.Pre(middleware.RemoveTrailingSlash())

    e.Logger.SetLevel(log.DEBUG)

    e.GET("/ws", geoWebsocket)

    e.Logger.Fatal(e.Start("localhost:8081"))
}

func geoWebsocket(c echo.Context) error {
    upgrader.CheckOrigin = func(r *http.Request) bool { return true }
    ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
    if err != nil {
        return err
    }
    defer ws.Close()

    geojsonPoint := `{
                       "type": "feature",
                       "geometry": {
                         "type": "point",
                         "coordinates": [
                           37.5334919,
                           55.6077987
                         ]
                       },
                       "properties": {
                         "client": "30457412",
                         "nph_request_id": "577341",
                         "nav_time": "2019-02-22t18:31:22.095480z"
                       }
                     }`

    point, err := geojson.UnmarshalFeature([]byte(geojsonPoint))
    if err != nil {
        c.Logger().Fatal(err)
    }

    for {
        if geoPkg, err := point.MarshalJSON(); err != nil {
            c.Logger().Error(err)
        } else {
            c.Logger().Debug("Send: ", string(geoPkg))

            if err := ws.WriteMessage(websocket.TextMessage, geoPkg); err != nil {
                c.Logger().Error(err)
            }
        }

        time.Sleep(1 * time.Second)
    }
}
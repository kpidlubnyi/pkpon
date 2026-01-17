export type Stop = {
    stop_id: string,
    stop_name: string,
    stop_lat: number,
    stop_lng: number,
}

export type GetStopsResponse = {
  stops: Stop[]
}


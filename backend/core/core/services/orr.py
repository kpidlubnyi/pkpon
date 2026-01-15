import requests

from django.conf import settings


ORR_URL: str = settings.ORR_URL
type Point = tuple[float, float]


def get_polyline_between_stops(start: Point, end: Point):
    p1 = f'{start[0]},{start[1]}'
    p2 = f'{end[0]},{end[1]}'

    params = [
        ("profile", "all_tracks"),
        ("point", p1),
        ("point", p2),
    ]

    resp = requests.get(f'{ORR_URL}/route', params=params)
    resp.raise_for_status()

    resp = resp.json()

    if not (path := resp.get('paths')[0]):
        raise Exception('No path found!')
    
    if not (p_line := path.get('points')):
        raise Exception('No polylyine found!')
    
    return p_line



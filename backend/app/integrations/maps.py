import math
from typing import Tuple

# Radius of Earth in kilometers
EARTH_RADIUS_KM = 6371.0


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points in meters."""
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_KM * c * 1000.0


def calculate_location_proximity_score(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Score distance within campus scale (0-500 meters):
    < 25m: 1.0
    < 75m: 0.9
    < 150m: 0.75
    < 300m: 0.50
    > 500m: 0.20
    """
    dist_meters = haversine_distance_meters(lat1, lon1, lat2, lon2)
    if dist_meters <= 25.0:
        return 1.0
    elif dist_meters <= 75.0:
        return 0.90
    elif dist_meters <= 150.0:
        return 0.75
    elif dist_meters <= 300.0:
        return 0.50
    elif dist_meters <= 500.0:
        return 0.30
    return 0.10

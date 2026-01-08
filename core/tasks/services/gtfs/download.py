import requests
from zipfile import ZipFile
from tempfile import SpooledTemporaryFile

from django.conf import settings

from core.services.redis import get_hash



class FeedGTFS:
    def __init__(self):
        feed: dict = FeedGTFS.get_recent_feed()
        self.sha: str = feed.get('sha1')
        self.gtfs_url: str = feed.get('url')

    @staticmethod
    def get_recent_feed() -> dict:  
        resp = requests.get(
            url=settings.TRANSITLAND_URL, 
            params= {
                'onestop_id': settings.PKP_ONESTOP_ID,
                'api_key': settings.TRANSITLAND_API_KEY,
            }
        )

        resp.raise_for_status()
        
        feeds = resp.json().get('feeds')
        if not feeds:
            raise ValueError('No feeds found!')

        versions = feeds[0].get('feed_versions')
        if not versions:
            raise ValueError('No versions for the feed found!')        
        
        return versions[0]
    
    @property
    def has_been_updated(self):
        redis_sha = get_hash()
        return self.sha != redis_sha


    def download_gtfs(self) -> ZipFile:
        spooled = SpooledTemporaryFile(max_size=20_000_000, mode='w+b')

        with requests.get(self.gtfs_url, stream=True) as resp:
            resp.raise_for_status()

            total_size = 0
            for chunk in resp.iter_content(chunk_size=512_000):
                if not chunk:
                    continue

                spooled.write(chunk)
                total_size += len(chunk)

        spooled.seek(0)
        return ZipFile(spooled)

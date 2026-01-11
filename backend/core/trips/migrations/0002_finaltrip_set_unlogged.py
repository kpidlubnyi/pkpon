from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('trips', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE "trips_FinalTrips" SET UNLOGGED;
            """,
            reverse_sql="""
                ALTER TABLE "trips_FinalTrips" SET LOGGED;
            """
        ),
    ]

from map.models import Trip


GOOGLE_SPREADSHEET_COLUMNS = [
    "start", "start_country", "start_lat", "start_long", "end",
    "end_country", "end_lat", "end_long", "year", "price",
    "lower_bound", "upper_bound", "ccy", "USD_equiv", "USD_equiv_avg",
    "one_person", "nationality_of_migrant", "nationality_of_smuggler",
    "service", "via", "source", "comment"
]


def google_spreadsheet_row_to_trip(row):
    columns_num = len(GOOGLE_SPREADSHEET_COLUMNS)
    trip = Trip()
    if len(row) > columns_num:
        for i in xrange(0, columns_num):
            setattr(trip, GOOGLE_SPREADSHEET_COLUMNS[i], row[i])
    return trip

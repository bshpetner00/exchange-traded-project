from tiingo import TiingoClient

config = {}

# To reuse the same HTTP Session across API calls (and have better performance), include a session key.
config['session'] = True

# If you don't have your API key as an environment variable,
# pass it in via a configuration dictionary.
config['api_key'] = "ea50972bedbd1a99dfd3593d0aa78e51e01a9e2b"

client = TiingoClient(config)

beeper = client.get_dataframe(['GOOGL', 'AAPL'],
                                      frequency='weekly',
                                      metric_name='volume',
                                      startDate='2017-01-01',
                                      endDate='2018-05-31')

print(beeper)

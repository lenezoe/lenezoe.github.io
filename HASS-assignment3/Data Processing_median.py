import pandas as pd

# Load the CSV file into a DataFrame
df = pd.read_csv(r"data\resale-flat-prices-based-on-registration-date-from-jan-2017-onwards.csv")

# Convert month column to year in YYYY format
df['year'] = pd.to_datetime(df['month'], format='%Y-%m').dt.strftime('%Y')

# Split the text column into multiple columns based on spaces
df[['years_only','unit_years','mths_only','unit_mths']] = df['remaining_lease'].str.split(' ', expand=True)
# df['mths_only'] = df['mths_only'].fillna(0)

# Change type of columns to numeric and coerce them to 0 if there are non-integer values
df['mths_only'] = pd.to_numeric(df['mths_only'], errors='coerce').fillna(0).astype(int)
df['years_only'] = pd.to_numeric(df['years_only'], errors='coerce').fillna(0).astype(int)

# Create the new column 'remain_leaseyears'. Add 1 to years_only if mths >6 to round to nearest year, otherwise remain as years_only
df.loc[df['mths_only'] > 6, 'remain_leaseyears'] = df['years_only'] + 1
df.loc[df['mths_only'] <= 6, 'remain_leaseyears'] = df['years_only']

# Round remaining_lease to nearest 5th year
df['rounded_lease'] = round(df['remain_leaseyears'] / 5) * 5

# Drop irrelevant columns
df = df.drop(columns=["unit_years", "unit_mths","storey_range","floor_area_sqm","years_only","mths_only","lease_commence_date"])

# Print the resulting dataframe
df.head()

# Save the DataFrame as a CSV file
df.to_csv('resaleflatprices_2017onwards.csv', index=False)

#Select specific attribute
df_new = df[df['year'].isin(['2022'])]
df_new.head()

# Aggregate the DataFrame by year, flat_type, and remain_leaseyears columns
df_new = df_new.groupby(['year', 'flat_type', 'town','remain_leaseyears','rounded_lease']).agg({'resale_price': 'median'}).reset_index()
df_new['resale_price'] = df_new['resale_price'].round(decimals=0)
df_new.head()

# Save the DataFrame as a CSV file
df_new.to_csv('medianflatprices_2022.csv', index=False)

# ------------- Specific Towns
#Select specific town
df_mature = df_new[df_new['town'].isin(['ANG MO KIO','BEDOK', 'BISHAN', 'BUKIT MERAH', 'BUKIT TIMAH', 'CENTRAL', 'CLEMENTI', 'GEYLANG', 'KALLANG/WHAMPOA', 'MARINE PARADE', 'PASIR RIS', 'QUEENSTOWN', 'SERANGOON', 'TAMPINES', 'TOA PAYOH'])]
df_nonmature = df_new[df_new['town'].isin(['BUKIT BATOK', 'BUKIT PANJANG', 'CHOA CHU KANG', 'HOUGANG', 'JURONG EAST', 'JURONG WEST', 'PUNGGOL', 'SEMBAWANG', 'SENGKANG', 'TENGAH', 'WOODLANDS', 'YISHUN'])]

### MATURE TOWN
# Aggregate the DataFrame by year, flat_type, and remain_leaseyears columns
df_mature = df_mature.groupby(['year', 'flat_type', 'town','remain_leaseyears','rounded_lease']).agg({'resale_price': 'median'}).reset_index()
df_mature['resale_price'] = df_mature['resale_price'].round(decimals=0)
df_mature.head()

# Save the DataFrame as a CSV file
df_mature.to_csv('medianflatprices_mature2022.csv', index=False)

### nonmature TOWN
# Aggregate the DataFrame by year, flat_type, and remain_leaseyears columns
df_nonmature = df_nonmature.groupby(['year', 'flat_type', 'town','remain_leaseyears','rounded_lease']).agg({'resale_price': 'median'}).reset_index()
df_nonmature['resale_price'] = df_nonmature['resale_price'].round(decimals=0)
df_nonmature.head()

# Save the DataFrame as a CSV file
df_nonmature.to_csv('medianflatprices_nonmature2022.csv', index=False)

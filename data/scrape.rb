require 'HTTParty'
require 'Nokogiri'
require 'csv'

# All of the stadiums to fetch info for
stadiums = [
  "Angel+Stadium", "AT%26T+Park", "Busch+Stadium", "Chase+Field", "Citi+Field",
  "Citizens+Bank+Park", "Comerica+Park", "Coors+Field", "Dodger+Stadium",
  "Fenway+Park", "Globe+Life+Park+in+Arlington", "Great+American+Ball+Park",
  "Kauffman+Stadium", "Marlins+Park", "Miller+Park", "Minute+Maid+Park",
  "Nationals+Park", "O.co+Coliseum", "Oriole+Park+at+Camden+Yards",
  "PETCO+Park", "PNC+Park", "Progressive+Field", "Rogers+Centre",
  "Safeco+Field", "Target+Field", "Tropicana+Field", "Turner+Field",
  "U.S.+Cellular+Field", "Wrigley+Field", "Yankee+Stadium"
]

# Fetch for every year from 2006 to 2016
years = (2006..2016).map { |y| y.to_s }

# Gets the URL to fetch the home run info for a given stadium and year
def get_url(stadium)
  'http://www.hittrackeronline.com/index.php?h=&p=&b=' + stadium +
  '&perpage=10000'
end

# Get the current working directory
cwd = File.dirname(__FILE__)

# Start fetching data
stadiums.each do |stadium|
  puts stadium

  CSV.open(File.join(cwd, 'teams', stadium) + '.csv', 'wb') do |csv|
    csv << [
      'Date', 'Video', 'Path', 'Hitter', 'Hitter Team', 'Pitcher',
      'Pitcher Team', 'Inning', 'Ballpark', 'Type/Luck', 'True Distance',
      'Speed Off Bat', 'Elevation Angle', 'Horizontal Angle', 'Apex',
      '# Parks'
    ]

    years.each do |year|
      puts "--> #{year}"

      # Fetch and parse the page into an object that can be queried
      page = HTTParty.get(get_url(stadium), cookies: {season: year})
      parsed_page = Nokogiri::HTML(page)

      # Get the table with all of the home runs
      tables = parsed_page.css(".forumline")
      table = tables.last

      # Go through all the rows in the table
      i = -1
      table.css('tr').each do |row|
        # Skip the header rows
        i += 1
        next if i < 3

        cols = row.css('td').map { |col| col.text.strip }
        next if cols.length == 1

        csv << cols
      end
    end
  end
end

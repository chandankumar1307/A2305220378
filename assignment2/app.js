import express from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;
const TIMEOUT = 500;

app.get('/numbers', async (req, res) => {
  const urls = req.query.url;

  if (!urls) {
    return res.status(400).json({ error: 'No URLs provided' });
  }

  const urlList = Array.isArray(urls) ? urls : [urls];
  const fetchPromises = [];

  for (const url of urlList) {
    fetchPromises.push(
      axios
        .get(url, { timeout: TIMEOUT })
        .then((response) => response.data.numbers)
        .catch((error) => {
          console.error(`Error fetching data from ${url}: ${error.message}`);
          return [];
        })
    );
  }

  try {
    const results = await Promise.allSettled(fetchPromises);
    const mergedNumbers = results
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => result.value)
      .filter((num, index, self) => num !== null && num !== undefined && self.indexOf(num) === index)
      .sort((a, b) => a - b);

    res.json({ numbers: mergedNumbers });
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

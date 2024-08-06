document.addEventListener("DOMContentLoaded", () => {
  const exchangeSelect = document.getElementById("exchange-select");
  const headerItems = document.querySelectorAll(".header-item");
  const themeSwitcher = document.getElementById("theme-switcher");
  let currentMarketId = exchangeSelect.value;
  let currentList = 0;
  let isDarkTheme = false;

  exchangeSelect.addEventListener("change", () => {
    currentMarketId = exchangeSelect.value;
    fetchData(currentMarketId, currentList);
  });

  headerItems.forEach((item) => {
    item.addEventListener("click", () => {
      currentList = item.getAttribute("data-list");
      fetchData(currentMarketId, currentList);
    });
  });

  themeSwitcher.addEventListener("click", () => {
    isDarkTheme = !isDarkTheme;
    document.body.className = isDarkTheme ? "dark-theme" : "light-theme";
  });

  function fetchData(marketId, list) {
    const url = `https://livefeed3.chartnexus.com/Dummy/quotes?market_id=${marketId}&list=${list}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => updateTable(data))
      .catch((error) => console.error("Error fetching data:", error));
  }

  function updateTable(data) {
    const tbody = document.querySelector("table tbody");
    tbody.innerHTML = "";

    data.forEach((stock) => {
      const last = formatNumber(stock.last);
      const volume = formatVolume(stock.volume);
      const buyPrice = formatNumber(stock.buy_price);
      const buyVolume = formatVolume(stock.buy_volume);
      const sellPrice = formatNumber(stock.sell_price);
      const sellVolume = formatVolume(stock.sell_volume);
      const previous = stock.previous !== undefined ? stock.previous : "N/A";

      const change =
        previous !== "N/A" ? formatNumber(stock.last - previous) : "N/A";
      const percentChange =
        previous !== "N/A"
          ? formatPercent((100 * (stock.last - previous)) / previous)
          : "N/A";
      const changeClass =
        previous !== "N/A" ? (stock.last < previous ? "red" : "green") : "";

      const row = document.createElement("tr");
      row.innerHTML = `
                <td>
                    <div>${stock.stockcode}</div>
                    <div class="stock-name">${stock.name}</div>
                </td>
                <td>
                    <div>${last}</div>
                    <div>${volume}</div>
                </td>
                <td class="${changeClass}">
                    <div>${change}</div>
                    <div>${percentChange}</div>
                </td>
                <td>
                    <div>${buyPrice}</div>
                    <div>${buyVolume}</div>
                </td>
                <td>
                    <div>${sellPrice}</div>
                    <div>${sellVolume}</div>
                </td>
            `;

      const lastCell = row.querySelector("td:nth-child(2) div:first-child");
      const volumeCell = row.querySelector("td:nth-child(2) div:last-child");

      // Check for changes and add flash class
      if (lastCell.innerHTML != last) {
        lastCell.classList.add("flash");
      }
      if (volumeCell.innerHTML != volume) {
        volumeCell.classList.add("flash");
      }

      tbody.appendChild(row);

      // Remove flash class after animation
      setTimeout(() => {
        lastCell.classList.remove("flash");
        volumeCell.classList.remove("flash");
      }, 1000);
    });
  }

  function formatNumber(number) {
    return parseFloat(number).toFixed(3);
  }

  function formatVolume(volume) {
    if (volume >= 1e6) {
      return (volume / 1e6).toFixed(2) + "M";
    } else if (volume >= 1e3) {
      return (volume / 1e3).toFixed(2) + "K";
    } else {
      return volume;
    }
  }

  function formatPercent(percent) {
    return percent.toFixed(2) + "%";
  }

  document.body.className = "light-theme";

  fetchData(currentMarketId, currentList);

  setInterval(() => fetchData(currentMarketId, currentList), 5000);
});

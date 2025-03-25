import React, { useState, useEffect } from "react";
import { useSpring, animated } from "react-spring";
import "./NewsBar.css";

interface NewsItem {
  title: string;
}

const NewsBar: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isHidden, setIsHidden] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetch_news_feed = async () => {
    try {
      const response = await fetch(
        `https://agrotools.qts-ar.com.ar/satimages/newsfeed`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Ensure data is an array
      if (Array.isArray(data)) {
        setNews(data);
      } else {
        // If not an array, consider it an error
        throw new Error("Invalid data format received");
      }

      setHasError(false);
    } catch (error) {
      console.error("Error fetching news feed:", error);
      setHasError(true);
    }
  };

  useEffect(() => {
    fetch_news_feed();
  }, []);

  const hideNewsBar = () => {
    setIsHidden(true);
  };

  const props = useSpring({
    from: { transform: "translateX(0%)" },
    to: { transform: "translateX(-50%)" },
    config: { duration: 100000 },
    reset: true,
    loop: true,
    onRest: () => {
      props.transform.set("translateX(0%)");
    }
  });

  // Hide component if there's an error, it's explicitly hidden, or no news items
  if (hasError || isHidden || news.length === 0) return null;

  return (
    <div className="total_wrapper">
      <div className="wrapper">
        <div className="marquee">
          <animated.ul style={props} className="marquee__group">
            {news.map((newsItem, index) => (
              <li key={index} className="marquee__item">
                {newsItem.title}
              </li>
            ))}
          </animated.ul>
        </div>
      </div>
      <button onClick={hideNewsBar}>X</button>
    </div>
  );
};

export default NewsBar;
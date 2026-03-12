import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSpring, animated } from "react-spring";
import "./NewsBar.css";

interface NewsItem { title: string }

const COMMODITIES = ["oat", "soybean_meal", "rough_rice"];
const API_URL = "https://api.api-ninjas.com/v1/commodityprice?name=";
const API_KEY = "A6i5a/zZOMN1Gyhp5Fk9ng==1Psane9F6qiqQo4N";

const NewsBar: React.FC = () => {
  const [baseNews, setBaseNews] = useState<NewsItem[]>([]);
  const [isHidden, setIsHidden] = useState(false);
  const [hasError, setHasError] = useState(false);

  /* --- fetch precios ---------------------------------------------------- */
  const fetchPrices = useCallback(async () => {
    try {
      const responses = await Promise.all(
        COMMODITIES.map((c) =>
          fetch(`${API_URL}${c}`, { headers: { "X-Api-Key": API_KEY } })
            .then((r) => r.json()),
        ),
      );

      const items = responses.map((d: any) => ({
        title: `${d.name}: ${d.price?.toFixed(2) ?? "-"} USD`,
      }));

      setBaseNews(items);
      setHasError(false);
    } catch (err) {
      console.error("Error fetching commodity prices:", err);
      setHasError(true);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchPrices]);

  /* --- duplicar hasta cubrir > 200 % ----------------------------------- */
  const news = useMemo(() => {
    if (baseNews.length === 0) return [];
    let dup = [...baseNews];
    while (dup.length < 20) dup = dup.concat(baseNews); // 20 ítems ≈ 8-9 rem cada uno
    return dup;
  }, [baseNews]);

  /* --- animación --------------------------------------------------------- */
  const marquee = useSpring({
    from: { transform: "translateX(0%)" },
    to: { transform: "translateX(-50%)" },
    config: { duration: 25000 },
    loop: true,
    reset: true,
  });

  if (hasError || isHidden || news.length === 0) return null;

  return (
    <div className="total_wrapper">
      <div className="wrapper">
        <div className="marquee">
          <animated.ul style={marquee} className="marquee__group">
            {news.map((item, i) => (
              <li key={i} className="marquee__item">{item.title}</li>
            ))}
          </animated.ul>
        </div>
      </div>
      <button onClick={() => setIsHidden(true)}>X</button>
    </div>
  );
};

export default NewsBar;

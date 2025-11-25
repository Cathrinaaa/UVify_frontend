// UV Index detailed information based on burn times and safety recommendations
export const getUVInfo = (uvi) => {
  if (uvi <= 2) {
    return {
      level: "Low",
      range: "1-2",
      color: "green",
      burnTime: "60 minutes",
      risk: "Minimal risk of sunburn",
      recommendations: [
        "Use sunscreen of at least SPF 30",
        "Still take precautions when going outdoors",
        "After 60 minutes, you can get a burn on unprotected skin",
      ],
      description:
        "A UV index of 1–2 puts you at minimal risk of sunburn, but still take precautions when going outdoors.",
    }
  }

  if (uvi <= 5) {
    return {
      level: "Moderate",
      range: "3-5",
      color: "yellow",
      burnTime: "45 minutes",
      risk: "Moderate risk",
      recommendations: [
        "Reapply sunscreen every two hours",
        "Wear sunglasses",
        "Limit time outside between 10 am and 4 pm",
        "The sun is most intense during midday hours",
      ],
      description:
        "There is a moderate risk at UV levels of 3–5, with burns occurring after 45 minutes of sun exposure.",
    }
  }

  if (uvi <= 7) {
    return {
      level: "High",
      range: "6-7",
      color: "orange",
      burnTime: "30 minutes",
      risk: "High risk",
      recommendations: [
        "Wear sun-protective clothing (long-sleeved shirt, long pants)",
        "Wear a hat with a wide brim",
        "Apply broad-spectrum sunscreen to uncovered skin",
        "Reapply sunscreen every two hours",
        "Avoid time outside or seek shade during peak sun hours",
      ],
      description: "Within 30 minutes of sun exposure at a UV index of 6–7, the sun can burn the skin.",
    }
  }

  if (uvi <= 10) {
    return {
      level: "Very High",
      range: "8-10",
      color: "red",
      burnTime: "15-25 minutes",
      risk: "Very high intensity",
      recommendations: [
        "Wear sunscreen of at least SPF 50",
        "Limit time outdoors",
        "Any unprotected skin can be affected",
        "Wear sun-protective clothing",
        "Seek shade when outdoors, especially during peak UV radiation hours (10 am–4 pm)",
      ],
      description:
        "At a UV index of 8–10, there is a high intensity of ultraviolet radiation. After just 15–25 minutes of exposure, you can burn.",
    }
  }

  return {
    level: "Extreme",
    range: "11+",
    color: "purple",
    burnTime: "Less than 10 minutes",
    risk: "Extreme - Long-lasting damage possible",
    recommendations: [
      "Apply SPF 50+ sunscreen",
      "Wear clothing that covers arms and legs",
      "Avoid direct contact with sunlight as much as possible",
      "Chronic exposure brings high risk of skin cancer",
      "Any exposure can cause long-lasting damage",
    ],
    description:
      "A UV index of 11+ is extreme. Any exposure to this UV intensity can cause long-lasting damage. In less than 10 minutes, you can get a sunburn.",
  }
}

export const getAllUVLevels = () => {
  return [
    {
      level: "Low",
      range: "1-2",
      color: "green",
      burnTime: "60 minutes",
      risk: "Minimal",
    },
    {
      level: "Moderate",
      range: "3-5",
      color: "yellow",
      burnTime: "45 minutes",
      risk: "Moderate",
    },
    {
      level: "High",
      range: "6-7",
      color: "orange",
      burnTime: "30 minutes",
      risk: "High",
    },
    {
      level: "Very High",
      range: "8-10",
      color: "red",
      burnTime: "15-25 minutes",
      risk: "Very High",
    },
    {
      level: "Extreme",
      range: "11+",
      color: "purple",
      burnTime: "<10 minutes",
      risk: "Extreme",
    },
  ]
}

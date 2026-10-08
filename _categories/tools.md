---
layout: project
id: 4
title: Tools
subtitle: Learning Resources
image: /assets/img/resources/zhenzhong-liu-02JRb0gOp30-unsplash.jpg
alt:
excerpt_separator: "<!--more-->"

caption:
  title: Tools
  thumbnail: /assets/img/resources/zhenzhong-liu-02JRb0gOp30-unsplash-thumb.jpg
---

{% assign locale = site.locale | slice: 0, 2 %}
{% if locale == "es" %}
## Herramientas STEM/STEAM Esenciales: Empoderando a los Creadores

Las colecciones curadas de herramientas STEM/STEAM proporcionan el software y las utilidades necesarias para construir, gestionar y escalar sus proyectos. Desde gestores de servidores hasta utilidades de desarrollo, estas herramientas son esenciales para cualquiera que busque profundizar en la tecnología y la ingeniería.
{% else %}
## Essential STEM/STEAM Tools: Empowering Creators

Curated collections of STEM/STEAM tools provide the necessary software and utilities to build, manage, and scale your projects. From server managers to development utilities, these tools are essential for anyone looking to dive deeper into technology and engineering.
{% endif %}

{% include resources_grid.html %}

---
layout: default
---
{% include navheader.html %}

{% assign marketplace_data = site.data.sitetext[site.locale].marketplace %}
<section class="bg-light" id="{{ marketplace_data.section | default: 'marketplace' }}">
  <div class="container">
    <div class="row">
      <div class="col-lg-12 text-center">
        <h2 class="section-heading text-uppercase">{{ marketplace_data.title | default: 'Marketplace' }}</h2>
        <p class="lead text-muted mb-5">{{ marketplace_data.text | default: 'Discover a world of interactive learning. Our curated marketplace features the highest quality apps and games to help you master the STEM skills of tomorrow.' }}</p>
      </div>
    </div>
    {% include marketplace_grid.html %}
  </div>
</section>

{% include services.html %}

{% include program_grid.html %}

{% include contact.html %}

const articles = [
  {
    id: 1,
    image: '/images/journal-01.png',
    alt: 'Artigo 1 do Diário da Cunhagem',
  },
  {
    id: 2,
    image: '/images/journal-02.png',
    alt: 'Artigo 2 do Diário da Cunhagem',
  },
  {
    id: 3,
    image: '/images/journal-03.png',
    alt: 'Artigo 3 do Diário da Cunhagem',
  },
  {
    id: 4,
    image: '/images/journal-04.png',
    alt: 'Artigo 4 do Diário da Cunhagem',
  },
]

function Journal() {
  return (
    <section
      aria-labelledby="journal-title"
      className="mt-16 sm:mt-20 lg:mt-24"
    >
      <div className="mb-8">
        <h2
          id="journal-title"
          className="text-2xl font-bold text-white md:text-3xl"
        >
          Diário da Cunhagem
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#B7A99A] sm:text-base">
          Fique por dentro das novidades, tendências e histórias do universo
          NFT.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        {articles.map((article) => (
          <article
            key={article.id}
            className="overflow-hidden rounded-xl bg-[#241612] transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
          >
            <img
              src={article.image}
              alt={article.alt}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full object-contain"
            />
          </article>
        ))}
      </div>
    </section>
  )
}

export default Journal
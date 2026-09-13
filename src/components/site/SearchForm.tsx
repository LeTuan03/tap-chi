import { SearchIcon } from "./Icons";

export default function SearchForm({ defaultValue = "", className = "" }: { defaultValue?: string; className?: string }) {
  return (
    <form className={`search-form ${className}`.trim()} action="/tim-kiem" method="get" role="search">
      <label htmlFor="site-search" className="sr-only">
        Tìm kiếm bài viết
      </label>
      <input id="site-search" type="search" name="q" defaultValue={defaultValue} placeholder="Tìm bài viết, làng nghề, nghệ nhân..." autoComplete="off" />
      <button type="submit" aria-label="Tìm kiếm" className="search-form__btn">
        <SearchIcon />
      </button>
    </form>
  );
}

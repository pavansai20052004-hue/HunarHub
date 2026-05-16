import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("HunarHub UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="container pageStack">
          <section className="card emptyState">
            <h1>Something went wrong</h1>
            <p>Please refresh the page and try again.</p>
            <button className="btn btnPrimary" onClick={() => window.location.reload()}>
              Refresh page
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-hello',
  standalone: true,
  template: `
    <h2>Hello</h2>
    <p>Workshop section 1. The simplest possible endpoint + view.</p>
    @if (message(); as m) {
      <p><strong>API says:</strong> {{ m }}</p>
    } @else {
      <p>loading…</p>
    }
  `,
})
export class HelloComponent implements OnInit {
  readonly message = signal<string | null>(null);

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get('http://localhost:3000/hello', { responseType: 'text' })
      .subscribe((body) => this.message.set(body));
  }
}



import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OnlyNumbersDirective } from './only-numbers.directive';

@Component({
  template: '<input type="text" numbersOnly>'
})
class TestComponent { }

describe('OnlyNumbersDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let inputEl: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, OnlyNumbersDirective]
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('input'));
  });

  it('should create an instance', () => {
    const directive = new OnlyNumbersDirective(inputEl);
    expect(directive).toBeTruthy();
  });

  it('should allow only numbers', () => {
    inputEl.nativeElement.value = '123';
    inputEl.nativeElement.dispatchEvent(new Event('input'));
    expect(inputEl.nativeElement.value).toEqual('123');
  });

  it('should not allow letters', () => {
    inputEl.nativeElement.value = 'abc';
    inputEl.nativeElement.dispatchEvent(new Event('input'));
    expect(inputEl.nativeElement.value).toEqual('');
  });
});

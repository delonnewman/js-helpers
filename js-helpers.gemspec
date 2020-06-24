# -*- encoding: utf-8 -*-
require File.expand_path('../lib/js/helpers/version', __FILE__)

Gem::Specification.new do |s|
  s.name        = "js-helpers"
  s.version     = Js::Helpers::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["Delon Newman"]
  s.email       = ["delnewman@salud.unm.edu"]
  s.homepage    = "https://git.health.unm.edu/devgroup/js-helpers"
  s.summary     = "A collection of Rails-like JS helper functions"
  s.description = s.summary
  s.license     = "MIT"

  s.required_ruby_version = ">= 1.9.3"
  s.required_rubygems_version = ">= 1.3.6"

  s.add_dependency "railties", ">= 4.2.0", "<= 5.2.4.3"
  s.add_dependency "thor",     ">= 0.14", "< 2.0"

  s.files        = `git ls-files`.split("\n")
  s.executables  = `git ls-files -- bin/*`.split("\n").map { |f| File.basename(f) }
  s.require_path = 'lib'
end

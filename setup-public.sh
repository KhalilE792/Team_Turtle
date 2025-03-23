#!/bin/bash

# Create directory structure
mkdir -p public/css public/js public/images public/html

# Move files from feature directory
cp feature/Stats.html public/html/
cp feature/FortuneTeller.html public/html/
cp feature/homepage.html public/html/

cp feature/Stats.css public/css/
cp feature/FortuneTeller.css public/css/
cp feature/sign-in.css public/css/

cp feature/stats_pig.png public/images/
cp feature/3.png public/images/ 
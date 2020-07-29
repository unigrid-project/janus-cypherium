# Copyright (c) 2013-2016 The Bitcoin Core developers
# Copyright (c) 2018-2019 The UNIGRID organization
# Distributed under the MIT software license, see the accompanying
# file COPYING or http://www.opensource.org/licenses/mit-license.php.

ACLOCAL_AMFLAGS = -I build-aux/m4
SUBDIRS = daemon
.PHONY: deploy FORCE

export PYTHONPATH

if BUILD_BITCOIN_LIBS
pkgconfigdir = $(libdir)/pkgconfig
pkgconfig_DATA = libbitcoinconsensus.pc
endif

BITCOIND_BIN=$(top_builddir)/daemon/$(BITCOIN_DAEMON_NAME)$(EXEEXT)
BITCOIN_CLI_BIN=$(top_builddir)/daemon/$(BITCOIN_CLI_NAME)$(EXEEXT)

empty :=
space := $(empty) $(empty)

DIST_DOCS = $(wildcard doc/*.md) $(wildcard doc/release-notes/*.md)
DIST_CONTRIB = $(top_srcdir)/contrib/unigrid-cli.bash-completion \
	       $(top_srcdir)/contrib/unigrid-tx.bash-completion \
	       $(top_srcdir)/contrib/unigridd.bash-completion \
           $(top_srcdir)/contrib/init \
           $(top_srcdir)/contrib/install_db4.sh

DIST_SHARE = \
           $(top_srcdir)/share/genbuild.sh \
           $(top_srcdir)/share/rpcauth

BIN_CHECKS=$(top_srcdir)/contrib/devtools/symbol-check.py \
           $(top_srcdir)/contrib/devtools/security-check.py

COVERAGE_INFO = baseline.info \
  test_unigrid_filtered.info total_coverage.info \
  baseline_filtered.info functional_test.info functional_test_filtered.info \
  test_unigrid_coverage.info test_unigrid.info

dist-hook:
	-$(GIT) archive --format=tar HEAD -- daemon/clientversion.cpp | $(AMTAR) -C $(top_distdir) -xf -

$(BITCOIND_BIN): FORCE
	$(MAKE) -C daemon $(@F)

$(BITCOIN_CLI_BIN): FORCE
	$(MAKE) -C daemon $(@F)

if USE_LCOV
LCOV_FILTER_PATTERN=-p "/usr/include/" -p "/usr/lib/" -p "daemon/leveldb/" -p "daemon/univalue" -p "daemon/secp256k1"

baseline.info:
	$(LCOV) -c -i -d $(abs_builddir)/daemon -o $@

baseline_filtered.info: baseline.info
	$(abs_builddir)/contrib/filter-lcov.py $(LCOV_FILTER_PATTERN) $< $@
	$(LCOV) -a $@ $(LCOV_OPTS) -o $@

test_unigrid.info: baseline_filtered.info
	$(MAKE) -C daemon/ check
	$(LCOV) -c $(LCOV_OPTS) -d $(abs_builddir)/daemon -t test_unigrid -o $@
	$(LCOV) -z $(LCOV_OPTS) -d $(abs_builddir)/daemon

test_unigrid_filtered.info: test_unigrid.info
	$(abs_builddir)/contrib/filter-lcov.py $(LCOV_FILTER_PATTERN) $< $@
	$(LCOV) -a $@ $(LCOV_OPTS) -o $@

functional_test.info: test_unigrid_filtered.info
	-@TIMEOUT=15 test/functional/test_runner.py $(EXTENDED_FUNCTIONAL_TESTS)
	$(LCOV) -c $(LCOV_OPTS) -d $(abs_builddir)/daemon --t functional-tests -o $@
	$(LCOV) -z $(LCOV_OPTS) -d $(abs_builddir)/daemon

functional_test_filtered.info: functional_test.info
	$(abs_builddir)/contrib/filter-lcov.py $(LCOV_FILTER_PATTERN) $< $@
	$(LCOV) -a $@ $(LCOV_OPTS) -o $@

test_unigrid_coverage.info: baseline_filtered.info test_unigrid_filtered.info
	$(LCOV) -a $(LCOV_OPTS) baseline_filtered.info -a test_unigrid_filtered.info -o $@

total_coverage.info: test_unigrid_filtered.info functional_test_filtered.info
	$(LCOV) -a $(LCOV_OPTS) baseline_filtered.info -a test_unigrid_filtered.info -a functional_test_filtered.info -o $@ | $(GREP) "\%" | $(AWK) '{ print substr($$3,2,50) "/" $$5 }' > coverage_percent.txt

test_unigrid.coverage/.dirstamp:  test_unigrid_coverage.info
	$(GENHTML) -s $(LCOV_OPTS) $< -o $(@D)
	@touch $@

total.coverage/.dirstamp: total_coverage.info
	$(GENHTML) -s $(LCOV_OPTS) $< -o $(@D)
	@touch $@

cov: test_unigrid.coverage/.dirstamp total.coverage/.dirstamp

endif

dist_noinst_SCRIPTS = autogen.sh

EXTRA_DIST = $(DIST_SHARE) $(DIST_CONTRIB) $(DIST_DOCS) $(BIN_CHECKS)

CLEANFILES = 

.INTERMEDIATE: $(COVERAGE_INFO)

DISTCHECK_CONFIGURE_FLAGS = --enable-man


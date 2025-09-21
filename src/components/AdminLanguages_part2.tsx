        {/* Length Issues Tab */}
        <TabsContent value="length-issues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Translation Length Issues
              </CardTitle>
              <CardDescription>
                Identify and fix translations that exceed recommended character limits. 
                Long translations can break UI layouts and affect user experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TextLengthManager
                issues={lengthIssues}
                onResolveLengthIssue={handleResolveLengthIssue}
              />

              {/* Guidelines Section */}
              {lengthIssues.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Translation Length Guidelines
                  </h3>
                  <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium mb-1">Recommended Limits:</div>
                        <ul className="space-y-1 text-xs">
                          <li>• Buttons: ≤110% of English</li>
                          <li>• Menu items: ≤115% of English</li>
                          <li>• Titles: ≤130% of English</li>
                          <li>• Descriptions: ≤150% of English</li>
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Quick Fixes:</div>
                        <ul className="space-y-1 text-xs">
                          <li>• Use abbreviations (info, max, min)</li>
                          <li>• Remove filler words (please, click)</li>
                          <li>• Use active voice</li>
                          <li>• Consider icons + shorter text</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Prevention Tips */}
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                  Prevention Tips for Translators
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                      Context Awareness
                    </div>
                    <p className="text-xs">
                      Understand where text appears (buttons need shorter text than descriptions)
                    </p>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                      Cultural Adaptation
                    </div>
                    <p className="text-xs">
                      Adapt content culturally while keeping length constraints in mind
                    </p>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                      Iterative Refinement
                    </div>
                    <p className="text-xs">
                      Start with accurate translation, then refine for optimal length
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>